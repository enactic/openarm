#!/bin/bash
#
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

set -euo pipefail

script=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/fetch-popular-issues.sh
test_dir=$(mktemp -d)
trap 'rm -rf "$test_dir"' EXIT
mkdir -p "$test_dir/bin" "$test_dir/static/data"
cat > "$test_dir/bin/gh" <<'EOF'
#!/bin/bash
cat "$TEST_RESPONSE"
exit "$TEST_STATUS"
EOF
chmod +x "$test_dir/bin/gh"
export PATH="$test_dir/bin:$PATH" TEST_RESPONSE="$test_dir/response.json"
cd "$test_dir"
printf '[{"number":123}]\n' > expected.json

check_failure() {
  printf '%s' "$1" > "$TEST_RESPONSE"
  export TEST_STATUS="$2"
  cp expected.json static/data/popular-issues.json
  if bash "$script" >stdout.log 2>stderr.log; then
    printf 'Expected the fetch to fail\n' >&2
    exit 1
  fi
  cmp expected.json static/data/popular-issues.json
  if compgen -G 'static/data/.popular-issues.*' > /dev/null; then
    printf 'Temporary output was left behind\n' >&2
    exit 1
  fi
}

check_failure '' 1
check_failure '{"data":{"search":{"nodes":[]}}}' 1
check_failure '{' 0
printf 'Failed fetches preserve the saved issues\n'

rm static/data/popular-issues.json
printf '' > "$TEST_RESPONSE"
export TEST_STATUS=1
if bash "$script" >stdout.log 2>stderr.log; then
  printf 'Expected the first fetch to fail\n' >&2
  exit 1
fi
test ! -e static/data/popular-issues.json
printf 'A failed first fetch leaves the output absent\n'

printf '{"data":{"search":{"nodes":[]}}}' > "$TEST_RESPONSE"
export TEST_STATUS=0
bash "$script"
jq -e '. == []' static/data/popular-issues.json > /dev/null
printf 'A successful fetch writes valid JSON\n'
