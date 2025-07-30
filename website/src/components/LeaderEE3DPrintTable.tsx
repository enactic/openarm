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

export interface LeaderEE3DPrintComponent {
  name: string;
  image: string;
  model: string;
  quantity: number;
  unitPrice: number;
}

const components: LeaderEE3DPrintComponent[] = [
  { name: 'Rail Connector (Leader)', image: 'rail-connector-leader.png', model: 'rail-connector-leader', quantity: 2, unitPrice: 500},
  { name: 'Swivel Rotor (Leader)', image: 'swivel-rotor-leader.png', model: 'swivel-rotor-leader', quantity: 2, unitPrice: 62},
  { name: 'Swivel Link (Leader)', image: 'swivel-link-leader.png', model: 'swivel-link-leader', quantity: 4, unitPrice: 10},
  { name: 'Right Pincer', image: 'right-pincer.png', model: 'right-pincer', quantity: 2, unitPrice: 100},
  { name: 'Left Pincer', image: 'left-pincer.png', model: 'left-pincer', quantity: 2, unitPrice: 100},
];

const columns: BoMTableColumn<LeaderEE3DPrintComponent>[] = [
  { header: 'Name', key: 'name' },
  { header: 'Photo', key: 'image' },
  { header: 'Model Number', key: 'model' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Estimated Unit Price (JPY)', key: 'unitPrice' },
  { header: 'Total Price (JPY)', key: 'totalPrice' },
];

export function LeaderEE3DPrintTotalCost(): number {
  return calculateTotalCost(components);
}

export default function LeaderEE3DPrintTable(): ReactNode {
  return (
    <BoMTable
      type="off-the-shelf"
      components={components}
      columns={columns}
      imageBasePath="leader-ee-3d-print"
    />
  );
}
