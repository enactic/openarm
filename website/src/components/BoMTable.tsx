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
import Table, { type TableColumn } from './Table';
import { formatPrice, formatTotalCost } from '../utils/priceUtils';

export interface BoMRecord {
  name: string;
  image: string;
  model: string | ReactNode;
  quantity: number;
  unitPrice: number;
}

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

export default function BoMTable<T extends BoMRecord>({
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

  const renderCell = (component: T, column: BoMTableColumn<T>): ReactNode => {
    switch (column.key) {
      case 'image':
        return component.image ? (
          <BoMPhoto
            src={require(`@site/static/img/hardware/bom/${imageBasePath}/${component.image}`).default}
            alt={component.name || ''}
          />
        ) : null;
      case 'unitPrice':
        return formatPrice(component.unitPrice);
      case 'totalPrice':
        return <strong>{formatPrice(component.unitPrice * component.quantity)}</strong>;
      default:
        return component[column.key as keyof T] as ReactNode;
    }
  };

  const tableColumns: TableColumn<T>[] = columns.map(column => ({
    header: column.header,
    key: column.key as keyof T,
    render: (row, _value) => renderCell(row, column)
  }));

  return (
    <div>
      <Admonition type="info">
        <p>The estimated total cost of {type} components is {totalCost}</p>
      </Admonition>
      <p>Here is the list of the components that {listSummary()}:</p>
      <Table
        columns={tableColumns}
        data={components}
        keyField="name"
      />
    </div>
  );
}
