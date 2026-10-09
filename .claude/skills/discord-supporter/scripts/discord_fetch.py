#!/usr/bin/env python3
# Copyright 2026 Enactic, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Print messages posted in public channels since the last check, as Markdown.

Usage:
  discord_fetch.py [--since 24h|7d|...] [--include-bots]
      List new messages. Does not advance the "last seen" markers; it only
      records them as pending.
  discord_fetch.py --commit [--hold CHANNEL_ID:MESSAGE_ID ...]
      Advance the "last seen" markers to what the previous fetch saw.
      With --hold, the marker of that channel/thread stops just before the
      held message, so it and everything after it reappear next time.
      Held threads are scanned even after they are archived.
  discord_fetch.py --channels
      List the public channels that would be scanned.

"Public" means channels that the @everyone role is allowed to view.
On the very first run (no state yet) only messages from the last --since
window (default 24h) are shown so the whole history is not dumped.
"""

import argparse
import datetime
import re
import sys
import time

import discord_api as api

TEXT = 0
VOICE = 2
CATEGORY = 4
ANNOUNCEMENT = 5
FORUM = 15
MEDIA = 16
PUBLIC_THREAD = 11
NEWS_THREAD = 10
VIEW_CHANNEL = 1 << 10


def parse_duration(text):
    m = re.fullmatch(r"(\d+)([hdw])", text)
    if not m:
        raise argparse.ArgumentTypeError("use forms like 12h, 3d, 2w")
    n, unit = int(m.group(1)), m.group(2)
    return n * {"h": 3600, "d": 86400, "w": 7 * 86400}[unit]


def is_public(channel):
    for ow in channel.get("permission_overwrites", []):
        if ow["id"] == api.GUILD_ID and int(ow["deny"]) & VIEW_CHANNEL:
            return False
    return True


def public_channels():
    channels = api.request("GET", f"/guilds/{api.GUILD_ID}/channels")
    by_id = {c["id"]: c for c in channels}
    result = []
    for c in channels:
        if c["type"] not in (TEXT, ANNOUNCEMENT, FORUM, MEDIA):
            continue
        if not is_public(c):
            continue
        parent = by_id.get(c.get("parent_id") or "")
        if parent and not is_public(parent) and not c.get("permission_overwrites"):
            continue
        result.append(c)
    result.sort(key=lambda c: (c.get("position", 0), c["name"]))
    return result


def active_threads(parent_ids):
    data = api.request("GET", f"/guilds/{api.GUILD_ID}/threads/active")
    return [t for t in data.get("threads", []) if t.get("parent_id") in parent_ids]


def held_thread(thread_id):
    # A held thread may have been deleted since; skip it instead of failing.
    try:
        return api.request("GET", f"/channels/{thread_id}")
    except SystemExit as e:
        print(f"Skipping held thread {thread_id}: {e}", file=sys.stderr)
        return None


def fetch_messages(channel_id, after):
    messages = []
    cursor = after
    while True:
        batch = api.request(
            "GET",
            f"/channels/{channel_id}/messages",
            {"after": cursor, "limit": 100},
        )
        if not batch:
            break
        batch.sort(key=lambda m: int(m["id"]))
        messages.extend(batch)
        cursor = batch[-1]["id"]
        if len(batch) < 100:
            break
    return messages


def parse_hold(text):
    m = re.fullmatch(r"(\d+):(\d+)", text)
    if not m:
        raise argparse.ArgumentTypeError("use CHANNEL_ID:MESSAGE_ID")
    return m.group(1), m.group(2)


def fmt_time(message):
    ts = api.time_from_snowflake(message["id"])
    return datetime.datetime.fromtimestamp(ts, datetime.timezone.utc).strftime(
        "%Y-%m-%d %H:%M UTC"
    )


def render(container, messages, heading):
    out = [f"## {heading}", ""]
    for m in messages:
        author = m["author"]
        name = author.get("global_name") or author.get("username")
        out.append(
            f"### {name} · {fmt_time(m)} · "
            f"[link]({api.message_link(container['id'], m['id'])})"
        )
        out.append(f"channel_id: `{container['id']}`  message_id: `{m['id']}`")
        if m.get("referenced_message"):
            ref = m["referenced_message"]["author"]
            out.append(f"(reply to {ref.get('global_name') or ref.get('username')})")
        out.append("")
        body = m.get("content", "").strip() or "_(no text)_"
        out.append("> " + body.replace("\n", "\n> "))
        for a in m.get("attachments", []):
            out.append(f"> attachment: {a.get('filename')} {a.get('url')}")
        out.append("")
    return out


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--since", type=parse_duration, default=parse_duration("24h"),
                   help="window used when a channel has no last-seen marker")
    p.add_argument("--include-bots", action="store_true",
                   help="include messages written by bots (default: skip)")
    p.add_argument("--commit", action="store_true",
                   help="mark everything from the previous fetch as seen")
    p.add_argument("--hold", type=parse_hold, action="append", default=[],
                   metavar="CHANNEL_ID:MESSAGE_ID",
                   help="with --commit, keep this message and later ones "
                        "in the channel/thread unseen (repeatable)")
    p.add_argument("--channels", action="store_true",
                   help="only list the public channels to be scanned")
    args = p.parse_args()

    state = api.load_state()

    if args.hold and not args.commit:
        p.error("--hold requires --commit")

    if args.commit:
        pending = state.get("pending", {})
        if not pending:
            print("Nothing pending.")
            return
        last_seen = state.get("last_seen", {})
        fetched = dict(pending)
        for channel_id, message_id in args.hold:
            if channel_id not in fetched:
                p.error(f"--hold: channel {channel_id} has nothing pending")
            # Snowflake IDs are ordered, so ID - 1 is just before the message.
            marker = int(message_id) - 1
            if marker < int(last_seen.get(channel_id, 0)):
                p.error(f"--hold: message {message_id} is already seen")
            if marker >= int(fetched[channel_id]):
                p.error(f"--hold: message {message_id} is not in the previous fetch")
            pending[channel_id] = str(min(marker, int(pending[channel_id])))
        state["last_seen"].update(pending)
        # Remember held IDs so that archived threads are still scanned.
        state["held"] = sorted({channel_id for channel_id, _ in args.hold})
        state["pending"] = {}
        api.save_state(state)
        print(f"Marked {len(pending)} channel(s)/thread(s) as seen.")
        return

    channels = public_channels()
    if args.channels:
        for c in channels:
            kind = {TEXT: "text", ANNOUNCEMENT: "news", FORUM: "forum", MEDIA: "media"}[c["type"]]
            print(f"{c['id']}  #{c['name']}  ({kind})")
        return

    cutoff = api.snowflake_from_time(time.time() - args.since)
    last_seen = state.get("last_seen", {})
    pending = {}
    scanned = set()
    sections = []
    total = 0

    def scan(container, heading):
        nonlocal total
        scanned.add(container["id"])
        after = last_seen.get(container["id"], str(cutoff))
        messages = fetch_messages(container["id"], after)
        if messages:
            pending[container["id"]] = messages[-1]["id"]
        if not args.include_bots:
            messages = [m for m in messages if not m["author"].get("bot")]
        if messages:
            total += len(messages)
            sections.extend(render(container, messages, heading))

    thread_parents = {c["id"]: c for c in channels}
    for c in channels:
        if c["type"] in (TEXT, ANNOUNCEMENT):
            scan(c, f"#{c['name']}")
    for t in active_threads(set(thread_parents)):
        parent = thread_parents[t["parent_id"]]
        scan(t, f"#{parent['name']} › {t['name']}")
    for thread_id in state.get("held", []):
        if thread_id in scanned:
            continue
        t = held_thread(thread_id)
        if not t or t.get("parent_id") not in thread_parents:
            continue
        parent = thread_parents[t["parent_id"]]
        scan(t, f"#{parent['name']} › {t['name']} (archived)")

    state["pending"] = pending
    api.save_state(state)

    print(f"# New Discord messages ({total})")
    print()
    if not sections:
        print("No new messages.")
        return
    print("\n".join(sections))


if __name__ == "__main__":
    main()
