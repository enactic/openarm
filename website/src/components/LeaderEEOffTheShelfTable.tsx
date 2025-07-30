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

export interface LeaderEEOffTheShelfComponent {
  name: string;
  image: string;
  model: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
}

const components: LeaderEEOffTheShelfComponent[] = [
  { name: 'Miniature Linear Guide Short Block', image: 'sse2bsz-mx10-135.png', model: 'SSE2BSZ-MX10-135', quantity: 2, unitPrice: 6500, supplier: 'MiSUMi'},
  { name: 'M3x6 bolt', image: 'm3-6.png', model: 'CBE3-6', quantity: 16, unitPrice: 70, supplier: 'MiSUMi'},
  { name: 'M3x8 bolt', image: 'm3-8.png', model: 'CBE3-8', quantity: 8, unitPrice: 56, supplier: 'MiSUMi'},
  { name: 'M3x12 bolt', image: 'm3-12.png', model: 'CBE3-12', quantity: 8, unitPrice: 75, supplier: 'MiSUMi'},
  { name: 'M3x15 bolt', image: 'm3-15.png', model: 'CBE3-15', quantity: 4, unitPrice: 75, supplier: 'MiSUMi'},
  { name: 'Step Bolt', image: 'dbsy4-5-4.png', model: 'DBSY4-5-4', quantity: 8, unitPrice: 440, supplier: 'MiSUMi'},
  { name: 'Bearing', image: 'mr126zz.png', model: 'MR126ZZ', quantity: 8, unitPrice: 482, supplier: 'MiSUMi'},
  { name: 'M4x4 Heat Set Insert', image: 'm4-4-heat-set-insert.png', model: 'M4x4x6', quantity: 8, unitPrice: 6, supplier: 'uxcell'},
  { name: 'M3x6 Heat Set Insert', image: 'm3-6-heat-set-insert.png', model: 'M3x6x5', quantity: 8, unitPrice: 6, supplier: 'uxcell'},
];

const columns: BoMTableColumn<LeaderEEOffTheShelfComponent>[] = [
  { header: 'Name', key: 'name' },
  { header: 'Photo', key: 'image' },
  { header: 'Model Number', key: 'model' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit Price (JPY)', key: 'unitPrice' },
  { header: 'Total Price (JPY)', key: 'totalPrice' },
  { header: 'Supplier', key: 'supplier' },
];

export function LeaderEEOffTheShelfTotalCost(): number {
  return calculateTotalCost(components);
}

export default function LeaderEEOffTheShelfTable(): ReactNode {
  return (
    <BoMTable
      type="off-the-shelf"
      components={components}
      columns={columns}
      imageBasePath="leader-ee-off-the-shelf"
    />
  );
}
