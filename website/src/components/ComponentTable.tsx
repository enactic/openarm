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

import React, {
  type ReactNode
} from 'react';
import ComponentPhoto from './ComponentPhoto';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { formatPrice } from '../utils/priceUtils';

export interface ComponentTableColumn<T> {
  header: string;
  key: keyof T | 'totalPrice';
}

interface ComponentTableProps<T> {
  components: T[];
  columns: ComponentTableColumn<T>[];
  imageBasePath: string;
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
  },
  bodyCell: {
    padding: '0.5rem',
    borderRight: '1px solid var(--ifm-color-emphasis-300)',
    verticalAlign: 'middle' as const,
  },
};

export { tableStyles };

export default function ComponentTable<T extends Record<string, any>>({ 
  components, 
  columns,
  imageBasePath
}: ComponentTableProps<T>): ReactNode {
  const renderCell = (component: T, column: ComponentTableColumn<T>) => {
    switch (column.key) {
      case 'image':
        return component.image ? (
          <ComponentPhoto
            src={useBaseUrl(`${imageBasePath}/${component.image}`)}
            alt={component.name || component.model || ''}
          />
        ) : null;
      case 'unitPrice':
        return formatPrice(component.unitPrice);
      case 'totalPrice':
        return <strong>{formatPrice(component.unitPrice * component.quantity)}</strong>;
      default:
        return component[column.key as keyof T];
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
          {components.map((component) => (
            <tr key={component.name} style={tableStyles.bodyRow}>
              {columns.map((column) => (
                <td key={column.header} style={tableStyles.bodyCell}>
                  {renderCell(component, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
