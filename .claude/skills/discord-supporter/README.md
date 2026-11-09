# discord-supporter

This directory is a Claude Code skill for semi-automatic support on the
OpenArm Discord. `SKILL.md` is the procedure that Claude Code follows.
This file is for humans who set up the bot.

## Set up the bot

1. Create an application in the
   [Discord Developer Portal](https://discord.com/developers/applications).
2. Open **Bot**:
   - Click **Reset Token** and copy the token. It is shown only once.
   - Enable **Message Content Intent**. Without it, the scripts get
     messages with empty content.
3. Open **OAuth2 → URL Generator**, select the `bot` scope and the
   following permissions, and open the generated URL to invite the bot to
   the server:
   - View Channels
   - Read Message History
   - Send Messages
   - Send Messages in Threads

The permissions are kept in the role that Discord creates for the bot.
You can change them later in **Server Settings → Roles** without inviting
the bot again.

## Set the token

Set the token in `DISCORD_TOKEN`. Claude Code starts a new shell for each
command, so `export` in a command doesn't persist. Set it in your shell
startup file such as `~/.zshenv`, or set it before starting Claude Code:

```sh
export DISCORD_TOKEN=...
```

Keep the token secret. Don't commit it or paste it into a conversation. If
it leaks, reset it in the Developer Portal.

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `DISCORD_TOKEN` | Bot token | (required) |
| `DISCORD_GUILD_ID` | Server ID | `1339899404546740275` (OpenArm) |
| `DISCORD_SUPPORTER_STATE` | Path of the state file | `state.json` in this directory |

## Check the setup

List the channels that the scripts scan:

```sh
python3 .claude/skills/discord-supporter/scripts/discord_fetch.py --channels
```

The scripts scan only public channels, which the `@everyone` role can
view. When you add a channel, make sure that it is listed, and run
`discord_fetch.py` without options. If the bot can't view a listed
channel because of the category or channel permissions, it fails with
`Discord API error 403`. Allow the bot role to view the channel in that
case.
