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

import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import type { LoadContext, Plugin } from '@docusaurus/types';

export type GitHubIssue = Awaited<ReturnType<Octokit['rest']['issues']['listForRepo']>>['data'][0];

interface GitHubIssuePluginOptions {
  owner: string;
  repo: string;
  state: 'closed' | 'open' | 'all';
  types?: string[];
  limit?: number;
  minReactions?: number;
  sortBy?: 'comments' | 'created' | 'updated';
  sortDirection?: 'asc' | 'desc';
}

export interface GitHubIssuePluginData {
  issues: GitHubIssue[];
  lastUpdated: string;
}

const DEFAULT_OPTIONS: Required<GitHubIssuePluginOptions> = {
  owner: 'enactic',
  repo: 'openarm',
  types: [],
  state: 'open',
  limit: 5,
  minReactions: 1,
  sortBy: 'updated',
  sortDirection: 'desc',
};

const createFallbackData = (): GitHubIssuePluginData => ({
  issues: [],
  lastUpdated: new Date().toISOString(),
});

const createOctokit = (): Octokit | null => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('[GitHub Issues Plugin] GITHUB_TOKEN not found, using fallback data');
    return null;
  }
  return new Octokit({ auth: token });
};

const buildRequestParams = (
  config: Required<GitHubIssuePluginOptions>
): RestEndpointMethodTypes["issues"]["listForRepo"]["parameters"] => (
  {
    owner: config.owner,
    repo: config.repo,
    types: config.types.join(','),
    state: config.state,
    sort: config.sortBy,
    direction: config.sortDirection,
    per_page: 30,
  }
);

const filterByReactions = (issues: GitHubIssue[], minReactions: number): GitHubIssue[] => {
  if (minReactions <= 0) return issues;
  return issues.filter(issue => issue.reactions['+1'] >= minReactions);
};

const sortByReactions = (issues: GitHubIssue[]): GitHubIssue[] =>
  [...issues].sort((a, b) => b.reactions['+1'] - a.reactions['+1']);

const processIssues = (
  issues: GitHubIssue[],
  config: Required<GitHubIssuePluginOptions>
): GitHubIssue[] => {
  const filteredIssues = filterByReactions(issues, config.minReactions);
  return sortByReactions(filteredIssues).slice(0, config.limit);
};

const createPluginData = (issues: GitHubIssue[]): GitHubIssuePluginData => ({
  issues,
  lastUpdated: new Date().toISOString(),
});

const fetchGitHubIssues = async (options: GitHubIssuePluginOptions): Promise<GitHubIssuePluginData> => {
  const octokit = createOctokit();
  if (!octokit) {
    return createFallbackData();
  }

  const config = { ...DEFAULT_OPTIONS, ...options };
  try {
    const requestParams = buildRequestParams(config);
    const response = await octokit.rest.issues.listForRepo(requestParams);
    const processedIssues = processIssues(response.data, config);
    return createPluginData(processedIssues);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[GitHub Issues Plugin] Failed to fetch issues: ${errorMessage}`);
    return createFallbackData();
  }
}

export default function gitHubIssuesPlugin(
  _context: LoadContext,
  options: GitHubIssuePluginOptions
): Plugin<GitHubIssuePluginData> {
  return {
    name: 'docusaurus-plugin-github-issues',
    async loadContent() {
      return await fetchGitHubIssues(options);
    },
    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;

      setGlobalData({
        issues: content.issues,
        lastUpdated: content.lastUpdated,
      });
    },
  };
}
