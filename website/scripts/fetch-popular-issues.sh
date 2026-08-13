#!/bin/bash
#
# Copyright 2025 Enactic, Inc.
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

mkdir -p static/data
# "gh issue list" only works with a single repository, so we use the
# GraphQL search API to collect issues across all enactic/* repositories.
gh api graphql \
  -f search='org:enactic is:issue state:open sort:reactions-+1-desc' \
  -f query='
query($search: String!) {
  search(query: $search, type: ISSUE, first: 20) {
    nodes {
      ... on Issue {
        author {
          login
          ... on User {
            name
          }
        }
        number
        reactionGroups {
          content
          users {
            totalCount
          }
        }
        repository {
          nameWithOwner
        }
        title
        updatedAt
        url
      }
    }
  }
}' | \
    jq '[.data.search.nodes[] | select(.reactionGroups[] | select(.content == "THUMBS_UP" and .users.totalCount > 0))] | .[0:5]' \
      > static/data/popular-issues.json
