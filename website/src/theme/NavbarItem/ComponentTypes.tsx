// Copyright 2026 Enactic, Inc.
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

// Wraps every navbar item type so that any item declared in `themeConfig.navbar.items`
// can be restricted to specific docs versions via an extra field:
// `docsVersions: ['2.0']`
// Items without `docsVersions` keep the original behavior (always shown).

import React from 'react';
import OriginalComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import {useActiveDocContext} from '@docusaurus/plugin-content-docs/client';

type VersionFilterProps = {
  docsVersions?: string[];
};

function withVersionFilter<P extends object>(
  Component: React.ComponentType<P>,
): React.ComponentType<P & VersionFilterProps> {
  return function VersionFilteredNavbarItem(props) {
    const {docsVersions, ...originalProps} = props;
    const {activeVersion} = useActiveDocContext('default');
    if (docsVersions && docsVersions.length > 0) {
      if (!activeVersion || !docsVersions.includes(activeVersion.name)) {
        return null;
      }
    }
    return <Component {...(originalProps as unknown as P)} />;
  };
}

const ComponentTypes = Object.fromEntries(
  Object.entries(OriginalComponentTypes).map(([key, Component]) => [
    key,
    withVersionFilter(Component as React.ComponentType<object>),
  ]),
) as typeof OriginalComponentTypes;

export default ComponentTypes;
