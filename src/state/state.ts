import { START_TIME_PASSED } from '../constants';
import { Provisions, fleets, Fleets } from '../game/world/fleets';
import type { Port } from '../game/port/port';
import type { World } from '../game/world/world';
import type { QuestId } from '../interface/quest/questData';
import { ItemId } from '../data/itemData';
import type { DiscoveryId } from '../data/discoveryData';
import type { BattleState } from '../game/world/seaBattle';

export type Stage = 'world' | 'port' | 'building';

export type Velocity = {
  direction: number;
  speed: number;
};

export type ProvisionsType = {
  [key in Provisions]: number;
};

type UsedShipsAtPort = { [key: string]: UsedShips };
export type UsedShips = { [key: string]: string };

export type Role =
  | number
  | 'firstMate'
  | 'bookKeeper'
  | 'chiefNavigator'
  | null;

type Mate = {
  sailorId: string;
  role: Role;
};

export interface State {
  portId: string | null;
  buildingId: string | null;
  timePassed: number;
  world: World;
  fleets: Fleets;
  seaArea: number | undefined;
  wind: Velocity;
  current: Velocity;
  playerFleet: Velocity;
  port: Port;
  dayAtSea: number;
  gold: number;
  quests: QuestId[];
  usedShipsAtPort: UsedShipsAtPort;
  savings: number;
  debt: number;
  items: ItemId[];
  mates: Mate[];
  luckBoost: number;
  portInvestments: { [portId: string]: { economy: number; industry: number } };
  nationalityIndex?: number; // overrides sailorId-derived nationality after defecting
  shipRewardsReceived?: string[]; // portIds where ruler gave a ship
  goldRewardsReceived?: string[]; // portIds where ruler gave gold (once per port)
  fame: { trade: number; piracy: number; adventure: number };
  friendship: { portugal: number; spain: number; turkey: number; england: number; italy: number; holland: number };
  discoveries: DiscoveryId[];
  battle: BattleState | null;
  guildQuest?: { discoveryId: string; rewardGold: number };
}

export const SAVED_STATE_KEY = 'savedState';

const savedState = JSON.parse(
  window.localStorage.getItem(SAVED_STATE_KEY) || '{}',
);

const state = {
  portId: '1',
  buildingId: null,
  timePassed: START_TIME_PASSED,
  fleets,
  wind: { direction: 0, speed: 3 },
  current: { direction: 0, speed: 0 },
  playerFleet: { direction: 0, speed: 0 },
  dayAtSea: 0,
  gold: 0,
  quests: [] as QuestId[],
  usedShipsAtPort: {},
  savings: 0,
  debt: 0,
  items: [],
  luckBoost: 0,
  portInvestments: {},
  fame: { trade: 0, piracy: 0, adventure: 0 },
  friendship: { portugal: 0, spain: 0, turkey: 0, england: 0, italy: 0, holland: 0 },
  discoveries: [] as DiscoveryId[],
  battle: null,
  mates: [
    {
      sailorId: '1',
      role: null,
    },
  ] as Mate[],
  ...savedState,
} as State;

export default state;
