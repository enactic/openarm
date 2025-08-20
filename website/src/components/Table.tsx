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

import React, { type ReactNode } from 'react';

export interface TableColumn<T> {
  header: string;
  key: keyof T;
  render?: (row: T, value: T[keyof T]) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
}

const tableStyles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  headerRow: {
    height: '8em',
    textAlign: 'center' as const,
    borderBottom: '3px solid var(--ifm-color-primary)',
    backgroundColor: 'var(--ifm-color-primary-lightest)',
    color: 'var(--ifm-color-primary-darkest)',
  },
  headerCell: {
    padding: '0.75rem',
    fontWeight: 'bold' as const,
    borderRight: '1px solid var(--ifm-color-primary)',
  },
  bodyRow: {
    height: '10em',
    textAlign: 'center' as const,
    borderBottom: '1px solid var(--ifm-color-emphasis-300)',
    backgroundColor: 'transparent',
  },
  bodyCell: {
    padding: '0.5rem',
    borderRight: '1px solid var(--ifm-color-emphasis-300)',
    verticalAlign: 'middle' as const,
    backgroundColor: 'transparent',
  },
};

export default function Table<T>({
  columns,
  data,
  keyField
}: TableProps<T>): ReactNode {
  const getCellContent = (row: T, column: TableColumn<T>): ReactNode => {
    if (column.render) {
      return column.render(row, row[column.key]);
    } else {
      return row[column.key] as ReactNode;
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyles.table}>
        <thead>
          <tr style={tableStyles.headerRow}>
            {columns.map((column) => (
              <th key={column.header} style={tableStyles.headerCell}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={(row[keyField] as string) || index} style={tableStyles.bodyRow}>
              {columns.map((column) => (
                <td key={column.header} style={tableStyles.bodyCell}>
                  {getCellContent(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
