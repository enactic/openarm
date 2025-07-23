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

export interface ElectricalComponent {
  name: string;
  image: string;
  model: ReactNode;
  quantity: number;
  unitPrice: number;
  supplier: string;
}

const components: ElectricalComponent[] = [
  { name: 'USB2CANFD converter', image: 'usb2canfd.jpg', model: <a href="https://a.co/d/hIi0SI1" target="_blank" rel="noopener noreferrer">USB to CANFD Converter Purchase Link</a>, quantity: 2, unitPrice: 20680, supplier: 'Pibiger'},
  { name: 'J1/J2 to Hub Cable', image: 'j1.png', model: <a href="/files/J1_J2.pdf" target="_blank" rel="noopener noreferrer">J1&J2 to Hub Cable Drawing</a>, quantity: 4, unitPrice: 384, supplier: 'LCSC'},
  { name: 'J3+J4 to Hub Cable', image: 'j3-j4.png', model: <a href="/files/J3_J4.pdf" target="_blank" rel="noopener noreferrer">J3+J4 to Hub Cable Drawing</a>, quantity: 2, unitPrice : 806, supplier: 'LCSC'},
  { name: 'J4+J5+J6+J7 to Hub Cable', image: 'j4-j7.png', model: <a href="/files/J4_J7.pdf" target="_blank" rel="noopener noreferrer">J4+J5+J6+J7 to Hub Cable Drawing</a>, quantity: 2, unitPrice: 1515, supplier: 'LCSC'},
  { name: 'J7 to J8 Cable', image: 'j7-j8.png', model: <a href="/files/J7_J8.pdf" target="_blank" rel="noopener noreferrer">J7 to J8 Cable Drawing</a>, quantity: 2, unitPrice: 256, supplier: 'LCSC'},
  { name: 'Communication Cable', image: 'communication.png', model: <a href="/files/communication.pdf" target="_blank" rel="noopener noreferrer">Communication Cable Drawing</a>, quantity: 2, unitPrice: 197, supplier: 'LCSC'},
  { name: 'Extension Cable', image: 'extension.png', model: <a href="/files/power_extension.pdf" target="_blank" rel="noopener noreferrer">Extension Cable Drawing</a>, quantity: 2, unitPrice: 197, supplier: 'LCSC'},
  { name: 'Power Supply', image: 'power-supply.jpg', model: <a href="https://www.aliexpress.com/item/1005004204524395.html" target="_blank" rel="noopener noreferrer">Power Supply Purchase Link</a>, quantity: 2, unitPrice: 14634, supplier: 'AliExpress'},
  { name: 'PCB', image: 'pcb.png', model: (
    <>
      <div>
        <a href="/files/Gerber_For_Hub.zip" target="_blank" rel="noopener noreferrer">Gerber Zip File</a>
      </div>
      <div>
        <a href="/files/BOM_For_Hub.csv" target="_blank" rel="noopener noreferrer">BOM CSV file</a>
      </div>
      <div>
        <a href="/files/CPL_For_Hub.xlsx" target="_blank" rel="noopener noreferrer">CPL xlsx file</a>
      </div>
    </>), quantity: 2, unitPrice: 520, supplier: 'JLCPCB'},
  { name: 'Connector', image: 'connector.jpg', model: 'C19268029 (do not need to purchase separately if using the LCSC PCB Assembly option)', quantity: 12, unitPrice: 60, supplier: 'LCSC'},
  { name: 'Emergency Stop', image: 'estop.jpg', model: <a href="https://www.monotaro.com/p/6001/0711/" target="_blank" rel="noopener noreferrer">Emergency Stop Purchase Link</a>, quantity: 1, unitPrice: 4698, supplier: 'Monotaro'},
];

const columns: BoMTableColumn<ElectricalComponent>[] = [
  { header: 'Name', key: 'name' },
  { header: 'Photo', key: 'image' },
  { header: 'Resource', key: 'model' },
  { header: 'Quantity', key: 'quantity' },
  { header: 'Unit Price (JPY)', key: 'unitPrice' },
  { header: 'Total Price (JPY)', key: 'totalPrice' },
  { header: 'Supplier', key: 'supplier' }
];

export function ElectricalTotalCost(): number {
  return calculateTotalCost(components);
}

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
