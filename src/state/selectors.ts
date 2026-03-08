import state, { Role } from './state';
import generateUsedShips from '../interface/port/shipyard/generateUsedShips';
import type { QuestId } from '../interface/quest/questData';
import { getPortData } from '../game/port/portUtils';
import { itemData } from '../data/itemData';
import { getPlayerFleet } from './selectorsFleet';
import createMap from '../map';
import { applyPositionDelta } from '../utils';
import getSailor from '../data/sailorData';
import { provisions } from '../game/world/fleets';
import { shipData } from '../data/shipData';
import { shipyardsToShips } from '../data/portShipyardData';
import type { GoodsId } from '../data/goodsData';

export const getTimeOfDay = () => state.timePassed % 1440;

export const isDay = () => {
  const timeOfDay = getTimeOfDay();

  return timeOfDay >= 240 && timeOfDay < 1200;
};

export const shouldUpdateWorldStatus = () => state.timePassed % 240 === 0;

export const positionAdjacentToPort = (portId: string) => {
  const { position } = getPortData(portId);
  const map = createMap([0, 0]);

  const offsetsToCheck = [
    { x: 0, y: -2 },
    { x: 2, y: 0 },
    { x: 0, y: 2 },
    { x: -2, y: 0 },
  ];

  const positionNoCollision = offsetsToCheck
    .map((offset) => applyPositionDelta(position, offset))
    .find((p) => !map.collisionAt(p));

  if (!positionNoCollision) {
    throw Error('No available tile was found adjacent to port');
  }

  return positionNoCollision;
};

export const finishedQuest = (id: QuestId) => state.quests.includes(id);

export const canAfford = (cost: number) => state.gold > cost;

// TODO reset used ships for a given port after some time has passed
export const getUsedShips = () => {
  const exitingUsedShips = state.usedShipsAtPort[state.portId!];

  if (exitingUsedShips) {
    return exitingUsedShips;
  }

  const usedShips = generateUsedShips(state.portId!);
  state.usedShipsAtPort[state.portId!] = usedShips;
  return usedShips;
};

export const getGold = () => state.gold;

export const getSavings = () => state.savings;

const CREDIT_LINE = 1000;

export const getCreditLine = () => Math.max(0, CREDIT_LINE - state.debt);

export const getDebt = () => state.debt;

export const getRepayAmount = () => Math.min(state.debt, state.gold);

export const getAtMosque = () =>
  state.portId && getPortData(state.portId).tileset === 2;

const secretItemShopOpen = () => {
  const timeOfDay = getTimeOfDay();
  return timeOfDay >= 120 && timeOfDay < 180;
};

export const getItemShopStock = () => {
  if (!state.portId) {
    return [];
  }

  const port = getPortData(state.portId);

  if (port.isSupplyPort || !port.itemShop) {
    return [];
  }

  const items = [...port.itemShop.regular];
  const secretItem = port.itemShop.secret;

  if (secretItem && secretItemShopOpen()) {
    items.push(secretItem);
  }

  return items.map((itemId) => ({
    id: itemId,
    name: itemData[itemId].name,
  }));
};

export const getPlayerItems = () =>
  state.items.map((itemId) => ({
    id: itemId,
    name: itemData[itemId].name,
  }));

export const getPlayerItem = (i: number) => itemData[state.items[i]];

export const getMates = () =>
  state.mates.map((mate) => ({
    ...mate,
    ...getSailor(mate.sailorId),
  }));

export const getCaptain = (shipI: Number) => {
  const mate = state.mates.find(({ role }) => role === shipI);

  if (!mate) {
    throw Error('No captain was found for the provided ship');
  }

  return getSailor(mate.sailorId);
};

export const getRoleDisplay = (role: Role) => {
  const fleet = getPlayerFleet();

  if (!fleet.length) {
    return '';
  }

  const flagshipName = fleet[0].name;

  if (role === null) {
    return `Navigator of ${flagshipName}`;
  }

  if (role === 'firstMate') {
    return `First Mate of ${flagshipName}`;
  }

  if (role === 'bookKeeper') {
    return `Bookkeeper of ${flagshipName}`;
  }

  if (role === 'chiefNavigator') {
    return `Chief Navigator of ${flagshipName}`;
  }

  if (role === 0) {
    return `Commodore of ${flagshipName}`;
  }

  const shipName = fleet[role].name;

  return `Captain of ${shipName}`;
};

// TODO needs to be implemented
export const getFirstMateId = () => '32';

export const isLisbon = () => state.portId === '1';

export const getPlayerGoods = (): { id: GoodsId; quantity: number }[] => {
  const fleet = getPlayerFleet();
  const goodsMap: { [id: string]: number } = {};

  fleet.forEach((ship) => {
    ship.cargo.forEach((item) => {
      if (!(provisions as readonly string[]).includes(item.type)) {
        goodsMap[item.type] = (goodsMap[item.type] || 0) + item.quantity;
      }
    });
  });

  return Object.entries(goodsMap)
    .filter(([, qty]) => qty > 0)
    .map(([id, quantity]) => ({ id: id as GoodsId, quantity }));
};

export const getCargoCapacityLeft = () => {
  const fleet = getPlayerFleet();
  let total = 0;
  let used = 0;

  fleet.forEach((ship) => {
    total += shipData[ship.id].capacity;
    ship.cargo.forEach((item) => {
      used += item.quantity;
    });
  });

  return total - used;
};

export const getCurrentMarketId = () => {
  if (!state.portId) return '1';
  const port = getPortData(state.portId);
  if (port.isSupplyPort) return '1';
  return port.marketId;
};

export const getNewShipsAvailable = () => {
  if (!state.portId) return [];
  const port = getPortData(state.portId);
  if (port.isSupplyPort) return [];
  const { industryId, industry } = port;
  return (shipyardsToShips[industryId] || []).filter(
    (ship) => ship.industryRequirement <= industry,
  );
};
