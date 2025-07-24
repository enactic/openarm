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
import BoMTable, { type BoMRecord, type BoMTableColumn } from './BoMTable';
import { calculateTotalCost } from '../utils/priceUtils';

export interface ArmOffTheShelfComponent extends BoMRecord {
  supplier: string;
}

const components: ArmOffTheShelfComponent[] = [
  { name: 'M3x6 bolt', image: 'm3-6.png', model: 'CBE3-6', quantity: 146, unitPrice: 44, supplier: 'MiSUMi' },
  { name: 'M3x8 bolt', image: 'm3-8.png', model: 'CBE3-8', quantity: 38, unitPrice: 56, supplier: 'MiSUMi' },
  { name: 'M3x15 bolt', image: 'm3-15.png', model: 'CBE3-15', quantity: 24, unitPrice: 52, supplier: 'MiSUMi' },
  { name: 'M3x18 bolt', image: 'm3-18.png', model: 'CBE3-18', quantity: 12, unitPrice: 54, supplier: 'MiSUMi' },
  { name: 'M4x6 bolt', image: 'm4-6.png', model: 'CBE4-6', quantity: 16, unitPrice: 54, supplier: 'MiSUMi' },
  { name: 'M4x8 bolt', image: 'm4-8.png', model: 'CBE4-8', quantity: 16, unitPrice: 61, supplier: 'MiSUMi' },
  { name: 'M4x10 bolt', image: 'm4-10.png', model: 'CBE4-10', quantity: 24, unitPrice: 59, supplier: 'MiSUMi' },
  { name: 'M5x10 bolt', image: 'm5-10.png', model: 'CBE5-10', quantity: 24, unitPrice: 59, supplier: 'MiSUMi' },
  { name: 'Circular Post - Threaded on Both Ends', image: 'circular-post-61.png', model: 'AETTS8-61-SC0-M3-N3', quantity: 2, unitPrice: 1120, supplier: 'MiSUMi' },
  { name: 'Circular Post - Threaded on Both Ends', image: 'circular-post-74-2.png', model: 'AETTS8-74.2-SC0-M3-N3', quantity: 4, unitPrice: 1120, supplier: 'MiSUMi' },
  { name: 'Step Bolt', image: 'dbsy465.png', model: 'DBSY4-6-5', quantity: 4, unitPrice: 425, supplier: 'MiSUMi' },
  { name: 'Single-row deep groove ball bearing', image: 'mr106zz1.png', model: 'MR106ZZ1', quantity: 4, unitPrice: 344, supplier: 'MiSUMi' },
  { name: 'Ball bearing, flanged, double shielded', image: 'fl6700zz.png', model: 'FL6700ZZ', quantity: 4, unitPrice: 880, supplier: 'MiSUMi' },
  { name: 'Ball bearing, flanged, double shielded', image: 'fl6803zz.png', model: 'FL6803ZZ', quantity: 2, unitPrice: 1950, supplier: 'MiSUMi' },
  { name: 'Ultra-thin resin washer', image: 'washer.png', model: 'SWSPS12-6-0.5', quantity: 8, unitPrice: 250, supplier: 'MiSUMi' }
];

const columns: BoMTableColumn<ArmOffTheShelfComponent>[] = [
  { header: 'Name', key: 'name' },
  { header: 'Photo', key: 'image' },
  { header: 'Model Number', key: 'model' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit Price (JPY)', key: 'unitPrice' },
  { header: 'Total Price (JPY)', key: 'totalPrice' },
  { header: 'Supplier', key: 'supplier' }
];

export function ArmOffTheShelfTotalCost(): number {
  return calculateTotalCost(components);
}

export default function ArmOffTheShelfTable(): ReactNode {
  return (
    <BoMTable
      type="off-the-shelf"
      components={components}
      columns={columns}
      imageBasePath="arm-off-the-shelf"
    />
  );
}
