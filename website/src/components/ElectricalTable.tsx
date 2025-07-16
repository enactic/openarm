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

export interface ElectricalComponent {
  name: string;
  image: string;
  model: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
}

const components: ElectricalComponent[] = [
  { name: 'USB2CANFD converter', image: 'usb2canfd.jpg', model: 'USB2CANFD-X2', quantity: 2, unitPrice: 25000, supplier: 'Pibiger'},
  { name: 'J1/J2 to Hub Cable', image: 'j1.png', model: 'XL2506130075-3', quantity: 4, unitPrice: 384, supplier: 'LCSC'},
  { name: 'J3+J4 to Hub Cable', image: 'j3-j4.png', model: 'XL2506130075-2', quantity: 2, unitPrice : 806, supplier: 'LCSC'},
  { name: 'J4+J5+J6+J7 to Hub Cable', image: 'j4-j7.png', model: 'XL2506130075-1', quantity: 2, unitPrice: 1515, supplier: 'LCSC'},
  { name: 'J7 to J8 Cable', image: 'images.jpg', model: 'Undecided', quantity: 2, unitPrice: 450, supplier: 'LCSC'},
  { name: 'Communication Cable', image: 'images.jpg', model: 'Undecided', quantity: 2, unitPrice: 450, supplier: 'LCSC'},
  { name: 'Power Supply', image: 'power-supply.jpg', model: '', quantity: 2, unitPrice: 14634, supplier: 'AliExpress'},
  { name: 'PCB', image: 'pcb.png', model: '24V 15A 1005004204524395', quantity: 2, unitPrice: 887, supplier: 'JLCPCB'},
  { name: 'Connector', image: 'images.jpg', model: 'C19268029', quantity: 12, unitPrice: 60, supplier: 'LCSC'},
  { name: 'Emergency Stop', image: 'estop.jpg', model: 'FB1W-HW1B-V402R-Y0', quantity: 1, unitPrice: 4698, supplier: 'Monotaro'},
];

const columns: BoMTableColumn<ElectiricalComponent>[] = [
  { header: 'Name', key: 'name' },
  { header: 'Photo', key: 'image' },
  { header: 'Model Number', key: 'model' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit Price (JPY)', key: 'unitPrice' },
  { header: 'Total Price (JPY)', key: 'totalPrice' },
  { header: 'Supplier', key: 'supplier' }
];

export default function ElectricalTable(): ReactNode {
  return (
    <BoMTable
      type="electrical"
      components={components}
      columns={columns}
      imageBasePath="electrical"
    />
  );
}
