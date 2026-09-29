---
name: discord-supporter
description: Check the OpenArm Discord for messages posted since the last check, decide with the maintainer which ones need a reply, draft replies grounded in the docs, and post them as the bot only after explicit approval.
---

# Discord supporter

Semi-automatic community support. You read new posts, propose replies, and
the maintainer approves each one. Nothing is posted without approval.

Scripts live in `.claude/skills/discord-supporter/scripts/` and need
`DISCORD_TOKEN` in the environment. State (last-seen message per channel)
is kept in `.claude/skills/discord-supporter/state.json`, which is ignored by
Git. Set `DISCORD_SUPPORTER_STATE` to use another path.

## Language

Talk to the maintainer (triage list, drafts, approval questions, final
report) in the maintainer's language. Decide it in this order: the
language the maintainer has written in during this session; otherwise the
system locale (`LANG`); otherwise English. Replies posted to Discord are
different: they always follow the poster's language (see reply
guidelines).

## Procedure

1. **Fetch.** Run:

   ```sh
   python3 .claude/skills/discord-supporter/scripts/discord_fetch.py
   ```

   It prints every message in public channels and their active threads
   since the last committed check. Use `--since 7d` on a first run or after
   a long gap; the default window is 24h when there is no marker.

2. **Triage.** Go through the messages in order. For each one decide:

   - **Skip**: chit-chat, announcements, messages already answered by a
     human in the same thread, or a follow-up where the maintainer is
     already engaged.
   - **Ask for details**: the question cannot be answered without more
     information (hardware version, OS, use case, error text, wiring).
     Drafting a short clarifying question is the most common outcome.
   - **Answer**: the docs contain the answer or enough facts to reason from.

   Present the maintainer with a compact list of the messages that need
   attention: author, channel, one-line summary, and your proposed action.
   Then handle them one at a time.

3. **Draft.** For each reply, ground it in `website/docs`. Search with
   grep and read the relevant page before writing. Cite the docs page with
   its public URL (see URL mapping below). Follow the reply guidelines.

4. **Approve.** Do not use the AskUserQuestion tool here: text written
   before a tool call may not be shown to the maintainer, who then cannot
   see what they are approving. Instead, end your turn with one message
   that contains everything needed to decide:

   - the original post (quoted), and its translation into the
     maintainer's language when the poster wrote in another language;
   - the facts you found and where (docs page, code, web), briefly;
   - the draft (quoted), and its translation when it is not in the
     maintainer's language;
   - a request to reply with Post, Edit (with the change), or Skip.

   The triage list from step 2 goes in a turn-ending message the same
   way. Never call `discord_post.py` before the maintainer replies Post.
   If they ask for an edit, apply it and show the full revised draft
   again.

5. **Post.** Write the approved text to a file in the scratchpad directory
   and run:

   ```sh
   python3 .claude/skills/discord-supporter/scripts/discord_post.py \
     --channel <channel_id> --reply-to <message_id> --file <path>
   ```

   `channel_id` and `message_id` are printed with each fetched message.
   For a forum post the channel id is the thread id.

6. **Commit the check.** After every message has been handled, run:

   ```sh
   python3 .claude/skills/discord-supporter/scripts/discord_fetch.py --commit
   ```

   This advances the markers so the next run starts after these messages.
   Do not commit if the session is interrupted midway; the unfinished
   messages will reappear next time.

7. **Report gaps.** If a question could not be answered because the docs
   are missing information, say so at the end so it can be added to the
   docs. A repeated question is a docs bug.

## Reply guidelines

- Reply in the language the poster used.
- Keep replies short. A few sentences plus a docs link is usually right.
  Discord limits messages to 2000 characters.
- Say what the docs say; do not invent numbers. Hardware questions about
  power, current, torque, and safety can damage equipment or hurt people
  when answered wrongly. If the docs do not cover it, ask for details or
  say the figure is not documented yet.
- When the answer depends on the poster's situation, ask for the missing
  facts instead of answering every case.
- Do not @-mention people or roles; the post script disables mentions by
  default. The only exception is when the maintainer explicitly asks to
  mention a specific user (for example a manufacturer's representative).
  In that case, before posting, ask once more in a turn-ending message
  whether the mention is intended, showing the user's display name and ID
  and the full message; only after the maintainer confirms, pass `--mention <user_id>` to
  `discord_post.py` and write `<@user_id>` in the body. Never mention
  @everyone or roles.
- Sign nothing; the bot identity is enough. Do not claim to be a human.
- Do not promise fixes, timelines, or features.

## Docs URL mapping

Docs are served at `https://docs.openarm.dev/` with the docs root at `/`.
A file `website/docs/<path>/<name>.mdx` maps to
`https://docs.openarm.dev/<path>/<name>`, with these adjustments:

- `index.md` / `index.mdx` map to the directory: `docs/faq/index.md` is
  `https://docs.openarm.dev/faq/`.
- Numeric prefixes are dropped: `docs/setup/openarm-setup/1-motor-id.mdx`
  is `https://docs.openarm.dev/setup/openarm-setup/motor-id`.
- A `slug:` in the front matter overrides the path. Check the file header
  when unsure.

## Useful facts already in the docs

- Motor electrical specs: `website/docs/hardware/openarm-2.0/motor.mdx`.
- Idle currents per motor for testing: `website/docs/setup/openarm-setup/1-motor-id.mdx`.
- OpenArm Cell power draw (whole cell, about 480 W without PC):
  `website/docs/hardware/openarm-cell/general.mdx`.
- Per-arm measured power consumption is not documented yet (FAQ says
  "preparing").
- Where to buy and manufacturer list: `website/docs/purchase/index.mdx`.
- Safety: `website/docs/overview/safety-guide.mdx`.
