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
import { ArmManufacturedTotalCost } from './ArmManufacturedTable';
import { ArmOffTheShelfTotalCost } from './ArmOffTheShelfTable';
import { PedestalManufacturedTotalCost } from './PedestalManufacturedTable';
import { PedestalOffTheShelfTotalCost } from './PedestalOffTheShelfTable';
import { GripperManufacturedTotalCost } from './GripperManufacturedTable';
import { GripperOffTheShelfTotalCost } from './GripperOffTheShelfTable';

interface MechanicalComponentRecord {
  component: string;
  link: string;
  linkText: string;
  cost: number;
}

const mechanicalComponentsData: MechanicalComponentRecord[] = [
  {
    component: 'Manufactured Arm Parts',
    link: 'arm-manufactured',
    linkText: 'View Parts',
    cost: ArmManufacturedTotalCost()
  },
  {
    component: 'Off-the-shelf Arm Parts',
    link: 'arm-off-the-shelf',
    linkText: 'View Parts',
    cost: ArmOffTheShelfTotalCost()
  },
  {
    component: 'Pedestal Components',
    link: 'pedestal',
    linkText: 'View Parts',
    cost: PedestalManufacturedTotalCost() + PedestalOffTheShelfTotalCost()
  },
  {
    component: 'Gripper Components',
    link: 'gripper',
    linkText: 'View Parts',
    cost: GripperManufacturedTotalCost() + GripperOffTheShelfTotalCost()
  }
];

const columns: TableColumn<MechanicalComponentRecord>[] = [
  {
    header: 'Component',
    key: 'component'
  },
  {
    header: 'Link',
    key: 'link',
    render: (row, _value) => <Link to={row.link}>{row.linkText}</Link>
  },
  {
    header: 'Cost',
    key: 'cost',
    render: (row, value) => formatPrice(value)
  }
];

export const MechanicalTotalCost = () =>
  mechanicalComponentsData.reduce((sum, record) => sum + record.cost, 0);

export default function MechanicalComponentsTable(): ReactNode {
  return (
    <>
      <h3>🛠 Mechanical Components (Total Cost: {formatPrice(MechanicalTotalCost())})</h3>
      <Table
        columns={columns}
        data={mechanicalComponentsData}
        keyField="component"
      />
    </>
  );
}
