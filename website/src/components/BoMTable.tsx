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
import Admonition from '@theme/Admonition';
import BoMPhoto from './BoMPhoto';
import { formatPrice, formatTotalCost } from '../utils/priceUtils';

export interface BoMTableColumn<T> {
  header: string;
  key: keyof T | 'totalPrice';
}

interface BoMTableProps<T> {
  type: 'manufactured' | 'off-the-shelf' | 'electrical';
  components: T[];
  columns: BoMTableColumn<T>[];
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
    backgroundColor: 'transparent',
  },
  bodyCell: {
    padding: '0.5rem',
    borderRight: '1px solid var(--ifm-color-emphasis-300)',
    verticalAlign: 'middle' as const,
    backgroundColor: 'transparent',
  },
};

export { tableStyles };

export default function BoMTable<T extends Record<string, any>>({
  type,
  components,
  columns,
  imageBasePath
}: BoMTableProps<T>): ReactNode {
  const totalCost = formatTotalCost(components);

  const listSummary = () => {
    switch (type) {
      case 'manufactured':
        return 'need to be manufactured';
      case 'off-the-shelf':
        return 'can be purchased off-the-shelf';
      case 'electrical':
        return 'are required for the electrical connections';
    }
  };

  const renderCell = (component: T, column: BoMTableColumn<T>) => {
    switch (column.key) {
      case 'image':
        return component.image ? (
          <BoMPhoto
            src={require(`@site/static/img/hardware/bom/${imageBasePath}/${component.image}`).default}
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
    <div>
      <Admonition type="info">
        <p>The estimated total cost of {type} components is {totalCost}</p>
      </Admonition>
      <p>Here is the list of the components that {listSummary()}:</p>
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
    </div>
  );
}
