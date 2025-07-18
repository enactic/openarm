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

export interface PedestalOffTheShelfComponent {
  name: string;
  image: string;
  model: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
}

const components: PedestalOffTheShelfComponent[] = [
  { name: '60x60 750mm Aluminum Extrusion', image: 'extrusion.png', model: 'HFSB6-6060-750', quantity: 1, unitPrice: 2760, supplier: 'MiSUMi'},
  { name: '30x60 60 Degrees Aluminum Extrusion Reinforcement Bracket', image: 'reinforcement.png', model: 'HFBL30A6-3060-123-SSP', quantity: 1, unitPrice: 4069, supplier: 'MiSUMi'},
  { name: 'M6 30/60 Angle Brackets + Bolt and Nut Set', image: 'bracket.png', model: 'HBLFSDW6-SEP', quantity: 2, unitPrice: 888, supplier: 'MiSUMi'},
  { name: 'Hexagonal Socket Head Bolts, Nickel Plated', image: 'cbm6-12.png', model: 'CBM6-12', quantity: 8, unitPrice: 148, supplier: 'MiSUMi'},
  { name: 'Post-insertion spring nuts for aluminum frames for 6 series (groove width 8 mm)', image: 'hntp6-6.png', model: 'HNTP6-6', quantity: 8, unitPrice: 44, supplier: 'MiSUMi'},
];

const columns: BoMTableColumn<PedestalOffTheShelfComponent>[] = [
  { header: 'Name', key: 'name' },
  { header: 'Photo', key: 'image' },
  { header: 'Model Number', key: 'model' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit Price (JPY)', key: 'unitPrice' },
  { header: 'Total Price (JPY)', key: 'totalPrice' },
  { header: 'Supplier', key: 'supplier' }
];

export function PedestalOffTheShelfTotalCost(): number {
  return calculateTotalCost(components);
}

export default function PedestalOffTheShelfTable(): ReactNode {
  return (
    <BoMTable
      type="off-the-shelf"
      components={components}
      columns={columns}
      imageBasePath="pedestal-off-the-shelf"
    />
  );
}
