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

import React, { type ReactNode } from 'react';
import { formatPrice } from '../utils/priceUtils';
import ActuatorsTable, { ActuatorTotalCost } from './ActuatorsTable';
import BlockImage from './BlockImage';
import { ElectricalTotalCost } from './ElectricalTable';
import ElectricalComponentsTable from './ElectricalComponentsTable';
import MechanicalComponentsTable, { MechanicalTotalCost } from './MechanicalComponentsTable';

export default function BoMSummary(): ReactNode {
  const totalBOMPrice = ActuatorTotalCost() + MechanicalTotalCost() + ElectricalTotalCost();

  return (
    <>
      <h2>The Total BOM Price is {formatPrice(totalBOMPrice)}</h2>
      <BlockImage
        src="hardware/bom/procurement/bom-summary.png"
        alt="BOM summary"
        width="70%"
      />
      <hr />
      <ActuatorsTable />
      <hr />
      <MechanicalComponentsTable />
      <hr />
      <ElectricalComponentsTable />
    </>
  );
}
