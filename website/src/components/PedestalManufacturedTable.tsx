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

export interface PedestalManufacturedComponent extends BoMRecord {
  method: string;
  material: string;
  manufacturer: string;
}

const components: PedestalManufacturedComponent[] = [
  { name: '250x190mm Base Plate', image: 'base-plate.png', model: 'MVBLK-ASN-48P-Y52TG-L', quantity: 1, unitPrice: 10081, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY'},
];

const columns: BoMTableColumn<PedestalManufacturedComponent>[] = [
  { header: 'Name', key: 'name' },
  { header: 'Photo', key: 'image' },
  { header: 'Model Number', key: 'model' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit Price (JPY)', key: 'unitPrice' },
  { header: 'Total Price (JPY)', key: 'totalPrice' },
  { header: 'Manufacturing Method', key: 'method' },
  { header: 'Material', key: 'material' },
  { header: 'Manufacturer', key: 'manufacturer' }
];

export function PedestalManufacturedTotalCost(): number {
  return calculateTotalCost(components);
}

export default function PedestalManufacturedTable(): ReactNode {
  return (
    <BoMTable
      type="manufactured"
      components={components}
      columns={columns}
      imageBasePath="pedestal-manufactured"
    />
  );
}
