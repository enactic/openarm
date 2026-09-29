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

"""Minimal Discord REST helpers shared by the discord-supporter scripts.

Only the standard library is used so the scripts run with any Python 3.
"""

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://discord.com/api/v10"
GUILD_ID = os.environ.get("DISCORD_GUILD_ID", "1339899404546740275")

# Discord epoch (2015-01-01T00:00:00Z) in milliseconds.
DISCORD_EPOCH_MS = 1420070400000


def token():
    value = os.environ.get("DISCORD_TOKEN")
    if not value:
        sys.exit("DISCORD_TOKEN is not set")
    return value


def request(method, path, params=None, body=None):
    url = API + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    data = None
    headers = {
        "Authorization": "Bot " + token(),
        "User-Agent": "openarm-discord-supporter (https://github.com/enactic/openarm, 1.0)",
    }
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    for _ in range(5):
        req = urllib.request.Request(url, data=data, method=method, headers=headers)
        try:
            with urllib.request.urlopen(req) as res:
                text = res.read().decode()
                return json.loads(text) if text else None
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = float(e.headers.get("Retry-After", "1"))
                time.sleep(wait + 0.1)
                continue
            detail = e.read().decode(errors="replace")
            sys.exit(f"Discord API error {e.code} for {method} {path}: {detail}")
    sys.exit(f"Discord API rate limit persisted for {method} {path}")


def snowflake_from_time(unix_seconds):
    return (int(unix_seconds * 1000) - DISCORD_EPOCH_MS) << 22


def time_from_snowflake(snowflake):
    return ((int(snowflake) >> 22) + DISCORD_EPOCH_MS) / 1000


def state_path():
    override = os.environ.get("DISCORD_SUPPORTER_STATE")
    if override:
        return override
    # .claude/skills/discord-supporter/state.json (ignored by Git)
    skill_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(skill_dir, "state.json")


def load_state():
    try:
        with open(state_path()) as f:
            return json.load(f)
    except FileNotFoundError:
        return {"last_seen": {}, "pending": {}}


def save_state(state):
    path = state_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(state, f, indent=2, sort_keys=True)
        f.write("\n")
    os.replace(tmp, path)


def message_link(channel_id, message_id):
    return f"https://discord.com/channels/{GUILD_ID}/{channel_id}/{message_id}"
