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
import Table, { type TableColumn } from './Table';
import { formatPrice } from '../utils/priceUtils';

interface ActuatorRecord {
  component: string;
  quantity: string;
  model: string;
  cost: number;
}

const actuatorsData: ActuatorRecord[] = [
  {
    component: 'DAMIAO Actuator',
    quantity: '4×',
    model: 'DM-J8009-2EC',
    cost: 205790
  },
  {
    component: 'DAMIAO Actuator',
    quantity: '2×',
    model: 'DM-J4340P-2EC',
    cost: 42066
  },
  {
    component: 'DAMIAO Actuator',
    quantity: '2×',
    model: 'DM-J4340-2EC',
    cost: 37387
  },
  {
    component: 'DAMIAO Actuator',
    quantity: '8×',
    model: 'DM-J4310-2EC V1.1',
    cost: 112113
  }
];

const columns: TableColumn<ActuatorRecord>[] = [
  {
    header: 'Component',
    key: 'component'
  },
  {
    header: 'Quantity',
    key: 'quantity'
  },
  {
    header: 'Model',
    key: 'model',
    render: (value) => <em>{value}</em>
  },
  {
    header: 'Cost',
    key: 'cost',
    render: (value) => formatPrice(value)
  }
];

export const ActuatorTotalCost = () =>
  actuatorsData.reduce((sum, record) => sum + record.cost, 0);

export default function ActuatorsTable(): ReactNode {
  return (
    <>
      <h3>✅Actuators (Total Cost: {formatPrice(ActuatorTotalCost())})</h3>
      <Table
        columns={columns}
        data={actuatorsData}
        keyField="component"
      />
    </>
  );
}
