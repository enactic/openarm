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
import BoMTable, { type BoMTableColumn } from './BoMTable';
import { calculateTotalCost } from '../utils/priceUtils';

export interface GripperOffTheShelfComponent {
  name: string;
  image: string;
  model: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
}

const components: GripperOffTheShelfComponent[] = [
  { name: 'Miniature Linear Guide Standard Block', image: 'rse2b10-155.png', model: 'RSE2B10-155', quantity: 2, unitPrice: 14940, supplier: 'MiSUMi'},
  { name: 'M3x5 bolt', image: 'm3-5.png', model: 'CBE3-5', quantity: 8, unitPrice: 70, supplier: 'MiSUMi'},
  { name: 'M3x8 bolt', image: 'm3-8.png', model: 'CBE3-8', quantity: 20, unitPrice: 56, supplier: 'MiSUMi'},
  { name: 'Small Diameter Head bolts M3x6', image: 'kbbs3-6.png', model: 'KBBS3-6', quantity: 32, unitPrice: 228, supplier: 'MiSUMi'},
  { name: 'Step Bolt', image: 'dbsy4-5-4.png', model: 'DBSY4-5-4', quantity: 8, unitPrice: 440, supplier: 'MiSUMi'},
  { name: 'Bearing', image: 'mr126zz.png', model: 'MR126ZZ', quantity: 8, unitPrice: 482, supplier: 'MiSUMi'},
];

const columns: BoMTableColumn<GripperOffTheShelfComponent>[] = [
  { header: 'Name', key: 'name' },
  { header: 'Photo', key: 'image' },
  { header: 'Model Number', key: 'model' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit Price (JPY)', key: 'unitPrice' },
  { header: 'Total Price (JPY)', key: 'totalPrice' },
  { header: 'Supplier', key: 'supplier' },
];

export function GripperOffTheShelfTotalCost(): number {
  return calculateTotalCost(components);
}

export default function GripperOffTheShelfTable(): ReactNode {
  return (
    <BoMTable
      type="off-the-shelf"
      components={components}
      columns={columns}
      imageBasePath="gripper-off-the-shelf"
    />
  );
}
