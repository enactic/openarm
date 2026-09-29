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

"""Post a reply to a Discord channel or thread.

Usage:
  discord_post.py --channel CHANNEL_ID --file reply.md [--reply-to MESSAGE_ID]
                  [--mention USER_ID ...]

For a forum post, CHANNEL_ID is the thread id (the channel_id printed by
discord_fetch.py). The message body is read from --file so that it can be
reviewed before posting. Prints the link of the posted message.

Mentions are disabled by default. --mention USER_ID enables the <@USER_ID>
in the body for that user only; @everyone, roles, and any other user stay
suppressed. The body must contain <@USER_ID> for each --mention, otherwise
the script refuses to post.
"""

import argparse
import sys

import discord_api as api

LIMIT = 2000


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--channel", required=True, help="channel or thread id")
    p.add_argument("--file", required=True, help="file containing the message body")
    p.add_argument("--reply-to", help="message id to reply to")
    p.add_argument(
        "--mention",
        action="append",
        default=[],
        metavar="USER_ID",
        help="user id whose <@USER_ID> in the body should notify them (repeatable)",
    )
    args = p.parse_args()

    with open(args.file) as f:
        body = f.read().strip()
    if not body:
        sys.exit("Refusing to post an empty message.")
    if len(body) > LIMIT:
        sys.exit(f"Message is {len(body)} characters; Discord allows {LIMIT}.")
    for user_id in args.mention:
        if not user_id.isdigit():
            sys.exit(f"--mention expects a numeric user id, got {user_id!r}.")
        if f"<@{user_id}>" not in body:
            sys.exit(f"--mention {user_id} given but <@{user_id}> is not in the body.")

    payload = {
        "content": body,
        "allowed_mentions": {"parse": []},
    }
    if args.mention:
        payload["allowed_mentions"]["users"] = args.mention
    if args.reply_to:
        payload["message_reference"] = {"message_id": args.reply_to}
        payload["allowed_mentions"]["replied_user"] = True

    posted = api.request("POST", f"/channels/{args.channel}/messages", body=payload)
    print(api.message_link(args.channel, posted["id"]))


if __name__ == "__main__":
    main()
