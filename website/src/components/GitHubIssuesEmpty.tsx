// Copyright 2025 Enactic, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';

const styles = {
  container: {
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'var(--ifm-background-color)',
    textAlign: 'center',
  } as React.CSSProperties,
  emptyState: {
    padding: '2rem',
    color: 'var(--ifm-color-emphasis-600)',
  } as React.CSSProperties,
  emptyStateP: {
    padding: '0.5rem 0',
  } as React.CSSProperties,
  emptyStateLink: {
    color: 'var(--ifm-color-primary)',
    textDecoration: 'none',
  } as React.CSSProperties,
};

export default function GitHubIssuesEmpty() {
  return (
    <div style={styles.container}>
      <div style={styles.emptyState}>
        <p style={styles.emptyStateP}>🔍 No popular issues found at the moment.</p>
        <p style={styles.emptyStateP}>
          Be the first to{' '}
          <a
            href="https://github.com/enactic/openarm/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.emptyStateLink}
          >
            create a feature request
          </a>{' '}
          or{' '}
          <a
            href="https://github.com/enactic/openarm/issues"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.emptyStateLink}
          >
            upvote existing ones
          </a>!
        </p>
      </div>
    </div>
  );
}
