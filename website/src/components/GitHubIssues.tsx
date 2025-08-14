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

import React, { ReactNode } from 'react';

interface ReactionGroup {
  content: string;
  users: {
    totalCount: number;
  };
}

interface GitHubIssue {
  number: number;
  title: string;
  url: string;
  updatedAt: string;
  author: {
    login: string;
    name: string;
  };
  reactionGroups: ReactionGroup[];
}

const styles = {
  container: {
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: '8px',
    overflow: 'hidden',
    textAlign: 'center',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'var(--ifm-color-emphasis-100)',
    borderBottom: '1px solid var(--ifm-color-emphasis-300)',
  } as React.CSSProperties,
  lastUpdated: {
    fontSize: '0.8rem',
    color: 'var(--ifm-color-emphasis-600)',
  } as React.CSSProperties,
  issueItem: {
    padding: '1rem',
    borderBottom: '1px solid var(--ifm-color-emphasis-200)',
    transition: 'background-color 0.2s ease',
    textAlign: 'left',
  } as React.CSSProperties,
  issueHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
    gap: '1rem',
  } as React.CSSProperties,
  issueTitle: {
    fontWeight: 600,
  } as React.CSSProperties,
  thumbsUp: {
    gap: '0.25rem',
    background: 'var(--ifm-color-emphasis-200)',
    padding: '0.25rem 0.5rem',
    borderRadius: '16px',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--ifm-color-emphasis-800)',
  } as React.CSSProperties,
  issueMeta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.85rem',
    color: 'var(--ifm-color-emphasis-600)',
  } as React.CSSProperties,
  issueNumber: {
    fontWeight: 500,
    color: 'var(--ifm-color-emphasis-700)',
  } as React.CSSProperties,
  footer: {
    padding: '0.75rem 1rem',
    background: 'var(--ifm-color-emphasis-100)',
    borderTop: '1px solid var(--ifm-color-emphasis-200)',
  } as React.CSSProperties,
  viewAllLink: {
    fontWeight: 500,
  } as React.CSSProperties,
  emptyState: {
    padding: '2rem',
    color: 'var(--ifm-color-emphasis-600)',
  } as React.CSSProperties,
  emptyStateP: {
    padding: '0.5rem 0',
  } as React.CSSProperties,
};

function loadPopularIssues(): GitHubIssue[] {
  try {
    return require('@site/static/data/popular-issues.json');
  } catch (e) {
    // If you need popular issues, please run: npm run fetch-popular-issues
    return [];
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getReactionCount(reactionGroups: ReactionGroup[], reactionType: string): number {
  const reaction = reactionGroups.find(group => group.content === reactionType);
  return reaction?.users.totalCount || 0;
}

function GitHubIssuesEmpty(): ReactNode {
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
          >
            create a feature request
          </a>{' '}
          or{' '}
          <a
            href="https://github.com/enactic/openarm/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            upvote existing ones
          </a>!
        </p>
      </div>
    </div>
  );
}

export default function GitHubIssues(): ReactNode {
  const issues = loadPopularIssues();

  if (issues.length === 0) {
    return <GitHubIssuesEmpty />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>🔥 Popular Feature Requests</div>
        <span style={styles.lastUpdated}>
          Last updated: {formatDate(new Date().toISOString())}
        </span>
      </div>
      <div>
        {issues.map((issue) => {
          const thumbsUpCount = getReactionCount(issue.reactionGroups, 'THUMBS_UP');

          return (
            <div
              key={issue.number}
              style={styles.issueItem}
            >
              <div style={styles.issueHeader}>
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.issueTitle}
                >
                  {issue.title}
                </a>
                <div>
                  {thumbsUpCount > 0 && (
                    <span style={styles.thumbsUp}>
                      👍 {thumbsUpCount}
                    </span>
                  )}
                </div>
              </div>
              <div style={styles.issueMeta}>
                <span style={styles.issueNumber}>
                  #{issue.number}
                </span>
                <span>
                  Updated {formatDate(issue.updatedAt)}
                </span>
                <span>
                  by{' '}
                  <a
                    href={`https://github.com/${issue.author.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {issue.author.login}
                  </a>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={styles.footer}>
        <a
          href="https://github.com/enactic/openarm/issues?q=is%3Aissue%20state%3Aopen%20sort%3Areactions-%2B1-desc%20type%3AFeature"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.viewAllLink}
        >
          View all feature requests →
        </a>
      </div>
    </div>
  );
}
