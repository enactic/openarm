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

export interface ArmManufacturedComponent {
  name: string;
  image: string;
  model: string;
  quantity: number;
  unitPrice: number;
  method: string;
  material: string;
  manufacturer: string;
}

const components: ArmManufacturedComponent[] = [
  { name: 'J1_A', image: 'j1-a.png', model: 'MVBLK-ASN-47X-F8WUL-L', quantity: 2, unitPrice: 7230, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY'},
  { name: 'J1_B', image: 'j1-b.png', model: 'MVBLK-ASN-486-16ZD6-L', quantity: 2, unitPrice: 6484, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J1_C', image: 'j1-c.png', model: 'MVBLK-ASN-47X-7DW6C-L', quantity: 2, unitPrice: 14243, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J1_D', image: 'j1-d.png', model: 'MVSHM-3N03040-47X-7P2BK-L', quantity: 2, unitPrice: 1690, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J1_E', image: 'j1-e.png', model: 'MVSHM-3N03040-48A-9B2W6-L', quantity: 2, unitPrice: 1590, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J2_A', image: 'j2-a.png', model: 'MVSHM-3N05042-47X-EZD5K-L', quantity: 2, unitPrice: 2401, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J2_B', image: 'j2-b.png', model: 'MVBLK-ASN-47X-HXB7K-L', quantity: 2, unitPrice: 11240, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J2_C', image: 'j2-c.png', model: 'MVSHM-3N01548-47X-GEMBC-L', quantity: 2, unitPrice: 1756, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J4_A', image: 'j4-a.png', model: 'MVSHM-3N02048-47X-4RRG8-L', quantity: 2, unitPrice: 3235, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J4_B', image: 'j4-b.png', model: 'MVTUP-ASN-47X-TMW2D-L', quantity: 2, unitPrice: 5930, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J4_C', image: 'j4-c.png', model: 'MVTUP-ASN-47X-8NHLF-L', quantity: 2, unitPrice: 5418, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J4_D', image: 'j4-d.png', model: 'MVSHM-3N02048-48B-TLEAD-L', quantity: 2, unitPrice: 1868, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J4_E', image: 'j4-e.png', model: 'MVSHM-3N02048-48B-SMRHW-L', quantity: 2, unitPrice: 2157, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J5_A', image: 'j5-a.png', model: 'MVTUP-ASN-487-P4H23-L', quantity: 2, unitPrice: 11394, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J6_A', image: 'j6-a.png', model: 'MVSHM-3N01548-47X-CME5R-L', quantity: 2, unitPrice: 1834, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J6_B', image: 'j6-b.png', model: 'MVSHM-3N01548-47X-7DB8J-L', quantity: 2, unitPrice: 1745, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J6_C_left', image: 'j6-c-left.png', model: 'MVSHM-3N0154A-47X-8YT9J-L', quantity: 1, unitPrice: 1901, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J6_C_right', image: 'j6-c-right.png', model: 'MVSHM-3N0154A-47X-ABMFW-L', quantity: 1, unitPrice: 1901, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J6_D', image: 'j6-d.png', model: 'MVSHM-3N03040-47X-73Z68-L', quantity: 2, unitPrice: 1556, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J7_A', image: 'j7-a.png', model: 'MVTUP-ASN-48A-16H77-L', quantity: 2, unitPrice: 13866, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J7_B', image: 'j7-b.png', model: 'MVBLK-ASN-48B-1B61U-L', quantity: 4, unitPrice: 5611, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J7_C', image: 'j7-c.png', model: 'MVBLK-ASN-47X-3A9BT-L', quantity: 2, unitPrice: 5674, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J7_D_left', image: 'j7-d-left.png', model: 'MVBLK-SUB-47X-U9BBA-L', quantity: 1, unitPrice: 9698, method: 'Metal Cutting (CNC)', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J7_D_right', image: 'j7-d-right.png', model: 'MVBLK-SUB-47X-J27PB-L', quantity: 1, unitPrice: 9698, method: 'Metal Cutting (CNC)', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J7_E', image: 'j7-e.png', model: 'MVBLK-SUB-47X-3XCT2-L', quantity: 2, unitPrice: 9099, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J8_A', image: 'j8-a.png', model: 'MVBLK-ASN-48E-Y9ATE-L', quantity: 2, unitPrice: 7141, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J8_B', image: 'j8-b.png', model: 'MVBLK-ASN-47X-PY1XN-L', quantity: 2, unitPrice: 12641, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' }
];

const columns: BoMTableColumn<ArmManufacturedComponent>[] = [
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

export function ArmManufacturedTotalCost(): number {
  return calculateTotalCost(components);
}

export default function ArmManufacturedTable(): ReactNode {
  return (
    <BoMTable
      type="manufactured"
      components={components}
      columns={columns}
      imageBasePath="arm-manufactured"
    />
  );
}
