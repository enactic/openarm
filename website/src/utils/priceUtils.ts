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

export const formatPrice = (price: number): string => {
  return price.toLocaleString('ja-JP', {
    style: 'currency',
    currency: 'JPY'
  });
};

export const calculateTotalCost = <T extends { unitPrice: number; quantity: number; }>(
  components: T[]
): number => {
  const accumulateCost = (total: number, component: T): number => {
    return total + (component.unitPrice * component.quantity);
  };

  return components.reduce(accumulateCost, 0);
};

export const formatTotalCost = <T extends { unitPrice: number; quantity: number; }>(
  components: T[]
): string => {
  const total = calculateTotalCost(components);
  return formatPrice(total);
};
