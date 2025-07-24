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
import Link from '@docusaurus/Link';
import Table, { type TableColumn } from './Table';
import { formatPrice } from '../utils/priceUtils';
import { ElectricalTotalCost } from './ElectricalTable';

interface ElectricalComponentRecord {
  component: string;
  link: string;
  linkText: string;
  cost: number;
}

const electricalComponentsData: ElectricalComponentRecord[] = [
  {
    component: 'All Electrical Components',
    link: 'electrical',
    linkText: 'View Components',
    cost: ElectricalTotalCost()
  }
];

const columns: TableColumn<ElectricalComponentRecord>[] = [
  {
    header: 'Component',
    key: 'component'
  },
  {
    header: 'Link',
    key: 'link',
    render: (value, row) => <Link to={row.link}>{row.linkText}</Link>
  },
  {
    header: 'Cost',
    key: 'cost',
    render: (value) => formatPrice(value)
  }
];

export default function ElectricalComponentsTable(): ReactNode {
  return (
    <>
      <h3>⚡Electrical Components (Total Cost: {formatPrice(ElectricalTotalCost())})</h3>
      <Table
        columns={columns}
        data={electricalComponentsData}
        keyField="component"
      />
    </>
  );
}
