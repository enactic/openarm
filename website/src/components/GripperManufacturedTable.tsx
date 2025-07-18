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

export interface GripperManufacturedComponent {
  name: string;
  image: string;
  model: string;
  quantity: number;
  unitPrice: number;
  method: string;
  material: string;
  manufacturer: string;
}

const components: GripperManufacturedComponent[] = [
  { name: 'rail_connector', image: 'rail-connector.png', model: 'MVSHM-3N0304G-47X-2982S-L', quantity: 2, unitPrice: '2969', method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY'},
  { name: 'rotor_controller', image: 'rotor-controller.png', model: 'MVBLK-ASN-487-ZX4P6-L', quantity: 2, unitPrice: '7414', method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY'},
  { name: 'gripper_linkage', image: 'rotor-linkage.png', model: 'MVBLK-SUB-487-HZGNT-L', quantity: 4, unitPrice: '8133', method: 'Metal Cutting (CNC)', material: 'SUS304', manufacturer: 'MiSUMi MEVIY'},
  { name: 'rail_CNC_attachment', image: 'rail-cnc-attachment.png', model: 'MVBLK-ASN-487-JNRUX-L', quantity: 4, unitPrice: '4600', method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY'},
];

const columns: BoMTableColumn<GripperManufacturedComponent>[] = [
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

export function GripperManufacturedTotalCost(): number {
  return calculateTotalCost(components);
}

export default function GripperManufacturedTable(): ReactNode {
  return (
    <BoMTable
      type="manufactured"
      components={components}
      columns={columns}
      imageBasePath="gripper-manufactured"
    />
  );
}
