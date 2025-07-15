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
import ComponentPhoto from './ComponentPhoto';
import useBaseUrl from '@docusaurus/useBaseUrl';

interface ManufacturedComponent {
  name: string;
  image: string;
  model: string;
  quantity: number;
  unitPrice: number;
  method: string;
  material: string;
  manufacturer: string;
}

const components: ManufacturedComponent[] = [
  { name: 'J1_A', image: 'J1_A.png', model: 'MVBLK-ASN-47X-F8WUL-L', quantity: 2, unitPrice: 7230, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY'},
  { name: 'J1_B', image: 'J1_B.png', model: 'MVBLK-ASN-486-16ZD6-L', quantity: 2, unitPrice: 6484, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J1_C', image: 'J1_C.png', model: 'MVBLK-ASN-47X-7DW6C-L', quantity: 2, unitPrice: 14243, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J1_D', image: 'J1_D.png', model: 'MVSHM-3N03040-47X-7P2BK-L', quantity: 2, unitPrice: 1690, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J1_E', image: 'J1_E.png', model: 'MVSHM-3N03040-48A-9B2W6-L', quantity: 2, unitPrice: 1590, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J2_A', image: 'J2_A.png', model: 'MVSHM-3N05042-47X-EZD5K-L', quantity: 2, unitPrice: 2401, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J2_B', image: 'J2_B.png', model: 'MVBLK-ASN-47X-HXB7K-L', quantity: 2, unitPrice: 11240, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J2_C', image: 'J2_C.png', model: 'MVSHM-3N01548-47X-GEMBC-L', quantity: 2, unitPrice: 1756, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J4_A', image: 'J4_A.png', model: 'MVSHM-3N02048-47X-4RRG8-L', quantity: 2, unitPrice: 3235, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J4_B', image: 'J4_B.png', model: 'MVTUP-ASN-47X-TMW2D-L', quantity: 2, unitPrice: 5930, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J4_C', image: 'J4_C.png', model: 'MVTUP-ASN-47X-8NHLF-L', quantity: 2, unitPrice: 5418, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J4_D', image: 'J4_D.png', model: 'MVSHM-3N02048-48B-TLEAD-L', quantity: 2, unitPrice: 1868, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J4_E', image: 'J4_E.png', model: 'MVSHM-3N02048-48B-SMRHW-L', quantity: 2, unitPrice: 2157, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J5_A', image: 'J5_A.png', model: 'MVTUP-ASN-487-P4H23-L', quantity: 2, unitPrice: 11394, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J6_A', image: 'J6_A.png', model: 'MVSHM-3N01548-47X-CME5R-L', quantity: 2, unitPrice: 1834, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J6_B', image: 'J6_B.png', model: 'MVSHM-3N01548-47X-7DB8J-L', quantity: 2, unitPrice: 1745, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J6_C_left', image: 'J6_C_left.png', model: 'MVSHM-3N0154A-47X-8YT9J-L', quantity: 1, unitPrice: 1901, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J6_C_right', image: 'J6_C_right.png', model: 'MVSHM-3N0154A-47X-ABMFW-L', quantity: 1, unitPrice: 1901, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J6_D', image: 'J6_D.png', model: 'MVSHM-3N03040-47X-73Z68-L', quantity: 2, unitPrice: 1556, method: 'Sheet Metal Fabrication', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J7_A', image: 'J7_A.png', model: 'MVTUP-ASN-48A-16H77-L', quantity: 2, unitPrice: 13866, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J7_B', image: 'J7_B.png', model: 'MVBLK-ASN-48B-1B61U-L', quantity: 4, unitPrice: 5611, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J7_C', image: 'J7_C.png', model: 'MVBLK-ASN-47X-3A9BT-L', quantity: 2, unitPrice: 5674, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J7_D_left', image: 'J7_D_left.png', model: 'MVBLK-SUB-47X-U9BBA-L', quantity: 1, unitPrice: 9698, method: 'Metal Cutting (CNC)', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J7_D_right', image: 'J7_D_right.png', model: 'MVBLK-SUB-47X-J27PB-L', quantity: 1, unitPrice: 9698, method: 'Metal Cutting (CNC)', material: 'SUS304', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J7_E', image: 'J7_E.png', model: 'MVBLK-SUB-47X-3XCT2-L', quantity: 2, unitPrice: 9099, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J8_A', image: 'J8_A.png', model: 'MVBLK-ASN-48E-Y9ATE-L', quantity: 2, unitPrice: 7141, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' },
  { name: 'J8_B', image: 'J8_B.png', model: 'MVBLK-ASN-47X-PY1XN-L', quantity: 2, unitPrice: 12641, method: 'Metal Cutting (CNC)', material: 'Al6061', manufacturer: 'MiSUMi MEVIY' }
];

const tableStyles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  headerRow: {
    height: '8em',
    textAlign: 'center' as const,
    borderBottom: '3px solid var(--ifm-color-primary)',
    backgroundColor: 'var(--ifm-color-primary-lightest)',
    color: 'var(--ifm-color-primary-darkest)',
  },
  headerCell: {
    padding: '0.75rem',
    fontWeight: 'bold' as const,
    borderRight: '1px solid var(--ifm-color-primary)',
  },
  bodyRow: {
    height: '10em',
    textAlign: 'center' as const,
    borderBottom: '1px solid var(--ifm-table-border-color)',
  },
  bodyCell: {
    padding: '0.5rem',
    borderRight: '1px solid var(--ifm-table-border-color)',
    verticalAlign: 'middle' as const,
  },
};

export default function ManufacturedTable(): ReactNode {
  const formatPrice = (price: number): string => (
    price.toLocaleString('ja-JP', {
      style: 'currency',
      currency: 'JPY'})
  );
  const calculateTotalCost = (): string => {
    const total = components.reduce(
      (sum, component) => sum + (component.unitPrice * component.quantity),
      0);
    return formatPrice(total);
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <p>
        <ins>
          {`The estimated total cost of manufactured components is ${calculateTotalCost()}`}
        </ins>
      </p>
      <p>
        Here is the list of the components that need to be manufactured:
      </p>
      <table style={tableStyles.table}>
        <thead>
          <tr style={tableStyles.headerRow}>
            <th style={tableStyles.headerCell}>Name</th>
            <th style={tableStyles.headerCell}>Photo</th>
            <th style={tableStyles.headerCell}>Model Number</th>
            <th style={tableStyles.headerCell}>Quantity</th>
            <th style={tableStyles.headerCell}>Unit Price (JPY)</th>
            <th style={tableStyles.headerCell}>Total Price (JPY)</th>
            <th style={tableStyles.headerCell}>Manufacturing Method</th>
            <th style={tableStyles.headerCell}>Material</th>
            <th style={tableStyles.headerCell}>Manufacturer</th>
          </tr>
        </thead>
        <tbody>
          {components.map((component) => (
            <tr key={component.name} style={tableStyles.bodyRow}>
              <td style={tableStyles.bodyCell}><strong>{component.name}</strong></td>
              <td style={tableStyles.bodyCell}>
                <ComponentPhoto
                  src={useBaseUrl(`/img/bom/manufactured_components/${component.image}`)}
                  alt={component.name}
                />
              </td>
              <td style={tableStyles.bodyCell}>{component.model}</td>
              <td style={tableStyles.bodyCell}>{component.quantity}</td>
              <td style={tableStyles.bodyCell}>{formatPrice(component.unitPrice)}</td>
              <td style={tableStyles.bodyCell}>
                <strong>{formatPrice(component.unitPrice * component.quantity)}</strong>
              </td>
              <td style={tableStyles.bodyCell}>{component.method}</td>
              <td style={tableStyles.bodyCell}>{component.material}</td>
              <td style={tableStyles.bodyCell}>{component.manufacturer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
