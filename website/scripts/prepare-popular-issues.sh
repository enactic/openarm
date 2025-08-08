#!/bin/bash

mkdir -p static/data
gh issue list \
  --repo enactic/openarm \
  --search "is:issue state:open sort:reactions-+1-desc type:Feature reactions:>=1" \
  --json number,title,url,reactionGroups,createdAt,author --limit 20 | \
jq '[.[] | select(.reactionGroups[]? | select(.content == "THUMBS_UP" and .users.totalCount > 0))] | .[0:5]' \
  > static/data/popular-issues.json
