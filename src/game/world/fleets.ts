import type { Position } from '../../types';

export const provisions = ['water', 'food', 'lumber', 'shot'] as const;
export type Provisions = typeof provisions[number];

interface Cargo {
  type: Provisions; // will be both Provisions and Goods
  quantity: number;
}

export type HullType = 'teak' | 'cedar' | 'beech' | 'oak' | 'copper' | 'iron';

export interface Ship {
  uid: string;
  id: string;
  name: string;
  crew: number;
  cargo: Cargo[];
  durability: number;
  hull?: HullType;       // hull material (default: 'teak')
  configBunks?: number;  // crew capacity slots (default: minimumCrew)
  configGuns?: number;   // gun slots (default: usedGuns)
  figurehead?: string;   // figurehead type name (reduces storm chance)
}

interface Fleet {
  position: Position | undefined;
  ships: Ship[];
}

export interface Fleets {
  [key: string]: Fleet;
}

export const fleets: Fleets = {
  '1': {
    position: undefined,
    ships: [],
  },
};
