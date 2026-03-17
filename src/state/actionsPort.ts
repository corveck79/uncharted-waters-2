import updateInterface from './updateInterface';
import { sample } from '../utils';
import state, { SAVED_STATE_KEY } from './state';
import { getUsedShips, isDay } from './selectors';
import { shipData } from '../data/shipData';
import { Provisions, Ship } from '../game/world/fleets';
import { minutesUntilNextMorning } from '../interface/interfaceUtils';
import type { QuestId } from '../interface/quest/questData';
import { getPlayerFleet, getPlayerFleetShip } from './selectorsFleet';
import { itemData, ItemId } from '../data/itemData';
import { hullData, GUN_CARGO_RATIO, REMODEL_COST_PER_CARGO, HULL_COST_PER_DURABILITY } from '../data/shipData';
import type { HullType } from '../game/world/fleets';

export const updateGeneral = () => {
  updateInterface.general({
    portId: state.portId,
    buildingId: state.buildingId,
    timePassed: state.timePassed,
    gold: state.gold,
  });
};

export const enterBuilding = (buildingId: string) => {
  state.buildingId = buildingId;

  updateGeneral();
};

export const exitBuilding = (sleep = false) => {
  if (!sleep) {
    state.timePassed += sample([40, 60, 80]);
  } else {
    state.timePassed += minutesUntilNextMorning(state.timePassed);
  }

  state.buildingId = null;

  if (isDay()) {
    state.port.characters().spawnNpcs();
  } else {
    state.port.characters().despawnNpcs();
  }

  updateGeneral();
};

export const getAvailableSailorId = () =>
  state.mates.slice(1).find(({ role }) => role === null || Number.isNaN(role))?.sailorId;

const generateShipUid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export const addShip = (ship: Omit<Ship, 'sailorId' | 'uid'>) => {
  const sailorId = getAvailableSailorId();
  const fleet = getPlayerFleet();

  fleet.push({ ...ship, uid: generateShipUid() });

  if (sailorId) {
    for (let i = 0; i < state.mates.length; i += 1) {
      if (state.mates[i].sailorId === sailorId) {
        state.mates[i].role = fleet.length - 1;
        break;
      }
    }
  }
};

const USED_SHIP_DURABILITY = 0.85;

export const buyUsedShip = (id: string, shipName: string) => {
  const usedShip = getUsedShips();
  const { durability, basePrice } = shipData[usedShip[id]];

  state.gold -= basePrice;

  addShip({
    id: usedShip[id],
    name: shipName,
    crew: 0,
    cargo: [],
    durability: Math.floor(durability * USED_SHIP_DURABILITY),
  });

  delete usedShip[id];

  updateGeneral();
};

export const SELL_SHIP_MODIFIER = 0.5;

export const sellShipNumber = (shipNumber: number) => {
  const { id } = getPlayerFleetShip(shipNumber);

  const fleet = getPlayerFleet();
  fleet.splice(shipNumber, 1);

  const sellPrice = shipData[id].basePrice * SELL_SHIP_MODIFIER;
  state.gold += sellPrice;

  for (let i = 0; i < state.mates.length; i += 1) {
    if (state.mates[i].role === shipNumber) {
      state.mates[i].role = null;
      break;
    }
  }

  if (fleet.length && shipNumber === 0) {
    const mate = state.mates.find(({ role }) => role === 1);

    if (mate) {
      mate.role = null;
    }
  }

  updateGeneral();
};

export const provisionCost: { [key in Provisions]: number } = {
  water: 0,
  food: 20,
  lumber: 90,
  shot: 120,
};

export const supplyShip = (
  shipNumber: number,
  provision: Provisions,
  quantity: number,
) => {
  const { cargo } = state.fleets['1'].ships[shipNumber];

  const notNew = cargo.some((item) => {
    if (item.type === provision) {
      // eslint-disable-next-line no-param-reassign
      item.quantity += quantity;
      return true;
    }

    return false;
  });

  if (notNew) {
    state.fleets['1'].ships[shipNumber].cargo = cargo;
  } else {
    state.fleets['1'].ships[shipNumber].cargo.push({
      type: provision,
      quantity,
    });
  }

  state.gold -= provisionCost[provision] * quantity;

  updateGeneral();
};

export const completeQuest = (id: QuestId) => {
  state.quests.push(id);
};

export const addFame = (type: 'trade' | 'piracy' | 'adventure', amount: number) => {
  if (!state.fame) state.fame = { trade: 0, piracy: 0, adventure: 0 };
  state.fame[type] += amount;
  updateGeneral();
};

export const acceptGuildQuest = (discoveryId: string, rewardGold: number) => {
  state.guildQuest = { discoveryId, rewardGold };
  window.localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(state));
};

export const claimGuildQuestReward = (): number => {
  if (!state.guildQuest) return 0;
  const { rewardGold } = state.guildQuest;
  state.gold += rewardGold;
  state.guildQuest = undefined;
  window.localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(state));
  updateGeneral();
  return rewardGold;
};

export const receiveGold = (amount: number, portId?: string) => {
  state.gold += amount;
  if (portId) {
    if (!state.goldRewardsReceived) state.goldRewardsReceived = [];
    state.goldRewardsReceived.push(portId);
    window.localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(state));
  }

  updateGeneral();
};

export const checkIn = () => {
  updateInterface.fade(() => {
    exitBuilding(true);
  });
};

export const exitBuildingIfNotLodge = () => {
  if (state.buildingId !== '5') {
    exitBuilding();
  }
};

export const receiveFirstShip = () => {
  const id = '6';

  const { durability } = shipData[id];

  addShip({
    id,
    name: 'Hermes II',
    crew: 0,
    cargo: [],
    durability: Math.floor(durability * USED_SHIP_DURABILITY),
  });

  updateGeneral();
};

export const recruitRocco = () => {
  state.mates.push({
    sailorId: '32',
    role: null,
  });
};

export const recruitMatthew = () => {
  state.mates.push({
    sailorId: '34',
    role: 'firstMate',
  });
};

export const receiveOttoShip = () => {
  const id = '8'; // Brigantine

  const { durability } = shipData[id];

  addShip({
    id,
    name: 'Idiot',
    crew: 0,
    cargo: [],
    durability: Math.floor(durability * USED_SHIP_DURABILITY),
  });

  updateGeneral();
};

export const recruitEmilio = () => {
  state.mates.push({
    sailorId: '35',
    role: 'firstMate',
  });
};

export const receiveCatalinaShip = () => {
  const id = '11'; // Galleon

  const { durability } = shipData[id];

  addShip({
    id,
    name: 'REBEL',
    crew: 0,
    cargo: [],
    durability: Math.floor(durability * USED_SHIP_DURABILITY),
  });

  updateGeneral();
};

export const recruitPaula = () => {
  state.mates.push({
    sailorId: '36',
    role: 'firstMate',
  });
};

export const recruitHans = () => {
  state.mates.push({
    sailorId: '40',
    role: 'firstMate',
  });
};

export const payBlockadeBribe = (amount: number) => {
  state.gold = Math.max(0, state.gold - amount);
  window.localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(state));
  updateGeneral();
};

export const receiveErnstShip = () => {
  const id = '6'; // Caravela Latina

  const { durability } = shipData[id];

  addShip({
    id,
    name: 'Meridian',
    crew: 0,
    cargo: [],
    durability: Math.floor(durability * USED_SHIP_DURABILITY),
  });

  updateGeneral();
};

export const recruitCamillo = () => {
  state.mates.push({
    sailorId: '37',
    role: 'firstMate',
  });
};

export const receivePietroShip = () => {
  const id = '6'; // Caravela Latina

  const { durability } = shipData[id];

  addShip({
    id,
    name: 'Falcon',
    crew: 0,
    cargo: [],
    durability: Math.floor(durability * USED_SHIP_DURABILITY),
  });

  updateGeneral();
};

export const recruitSalim = () => {
  state.mates.push({
    sailorId: '38',
    role: 'firstMate',
  });
};

export const receiveAliShip = () => {
  const id = '3'; // Dhow

  const { durability } = shipData[id];
  const fleet = getPlayerFleet();

  fleet.push({
    uid: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
    id,
    name: 'Savahni',
    crew: 0,
    cargo: [],
    durability: Math.floor(durability * USED_SHIP_DURABILITY),
  });

  // Assign to an available mate if one exists
  const sailorId = getAvailableSailorId();
  if (sailorId) {
    for (let i = 0; i < state.mates.length; i += 1) {
      if (state.mates[i].sailorId === sailorId) {
        state.mates[i].role = fleet.length - 1;
        break;
      }
    }
  }

  updateGeneral();
};

export const recruitEnrico = () => {
  state.mates.push({
    sailorId: '33',
    role: null,
  });
};

export const assignFirstRoles = () => {
  if (Number.isNaN(state.mates[1].role)) {
    state.mates[1].role = 'firstMate';
  }

  if (Number.isNaN(state.mates[2].role)) {
    state.mates[2].role = 'bookKeeper';
  }

  /*
    In the original game, no check is done before assigning Rocco and Enrico their roles.
    If you hand them ships, they’ll be assigned First Mate and Bookkeeper while still
    remaining as captains (allowing them to captain 2 ships each).
   */
};

export const deposit = (amount: number) => {
  state.savings += amount;
  state.gold -= amount;

  updateGeneral();
};

export const withdraw = (amount: number) => {
  state.savings -= amount;
  state.gold += amount;

  updateGeneral();
};

export const borrow = (amount: number) => {
  state.debt += amount;
  state.gold += amount;

  updateGeneral();
};

export const repay = (amount: number) => {
  state.debt -= amount;
  state.gold -= amount;

  updateGeneral();
};

export const pray = () => {
  state.luckBoost = 1;
};

export const donate = (amount: number) => {
  const percent = (amount / state.gold) * 100;
  state.gold -= amount;

  updateGeneral();

  return percent;
};

export const buyItem = (id: ItemId, gift = false, customPrice?: number) => {
  if (!gift) {
    const price = customPrice ?? itemData[id].price;

    if (price > state.gold) {
      return false;
    }

    state.gold -= price;
  }

  state.items.push(id);

  updateGeneral();

  return true;
};

export const ITEM_SHOP_SELL_MULTIPLIER = 0.5;

export const sellItem = (i: number) => {
  const id = state.items[i];
  const { price } = itemData[id];

  state.gold += price * ITEM_SHOP_SELL_MULTIPLIER;
  state.items.splice(i, 1);

  updateGeneral();

  return true;
};

export const buyGoods = (goodsId: string, quantity: number, pricePerUnit: number) => {
  const flagship = state.fleets['1'].ships[0];
  if (!flagship) return;

  state.gold -= quantity * pricePerUnit;

  const existing = flagship.cargo.find((item) => item.type === goodsId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    flagship.cargo.push({ type: goodsId as any, quantity });
  }

  updateGeneral();
};

export const sellGoods = (goodsId: string, quantity: number, pricePerUnit: number) => {
  const flagship = state.fleets['1'].ships[0];
  if (!flagship) return;

  const revenue = quantity * pricePerUnit;
  state.gold += revenue;

  flagship.cargo = flagship.cargo
    .map((item) =>
      item.type === goodsId ? { ...item, quantity: item.quantity - quantity } : item,
    )
    .filter((item) => item.quantity > 0);

  if (!state.fame) state.fame = { trade: 0, piracy: 0, adventure: 0 };
  state.fame.trade += revenue;

  updateGeneral();
};

export const buyNewShip = (shipId: string, shipName: string) => {
  state.gold -= shipData[shipId].basePrice;

  addShip({
    id: shipId,
    name: shipName,
    crew: 0,
    cargo: [],
    durability: shipData[shipId].durability,
  });

  updateGeneral();
};

// Calculate effective cargo given a ship's current or prospective configuration
export const getEffectiveCargo = (
  shipId: string,
  configBunks: number,
  configGuns: number,
): number => {
  const data = shipData[shipId];
  const extraBunks = configBunks - data.minimumCrew;
  const extraGuns = configGuns - data.usedGuns;
  return Math.max(0, data.capacity - extraBunks - extraGuns * GUN_CARGO_RATIO);
};

export const getRemodelCost = (
  shipId: string,
  currentBunks: number,
  currentGuns: number,
  newHull: HullType,
  newBunks: number,
  newGuns: number,
): number => {
  const currentCargo = getEffectiveCargo(shipId, currentBunks, currentGuns);
  const newCargo = getEffectiveCargo(shipId, newBunks, newGuns);
  const cargoCost = Math.abs(newCargo - currentCargo) * REMODEL_COST_PER_CARGO;
  const hullCost = hullData[newHull].durabilityBonus * HULL_COST_PER_DURABILITY;
  return Math.max(100, cargoCost + hullCost);
};

export const remodelShip = (
  shipNumber: number,
  newHull: HullType,
  newBunks: number,
  newGuns: number,
) => {
  const ship = state.fleets['1'].ships[shipNumber];
  const data = shipData[ship.id];

  const currentBunks = ship.configBunks ?? data.minimumCrew;
  const currentGuns = ship.configGuns ?? data.usedGuns;
  const cost = getRemodelCost(ship.id, currentBunks, currentGuns, newHull, newBunks, newGuns);

  state.gold -= cost;
  ship.hull = newHull;
  ship.configBunks = newBunks;
  ship.configGuns = newGuns;
  ship.durability = data.durability + hullData[newHull].durabilityBonus;
  updateGeneral();
};

export const renameShip = (shipNumber: number, newName: string) => {
  state.fleets['1'].ships[shipNumber].name = newName;
  updateGeneral();
};

export const setFigurehead = (shipNumber: number, figureheadName: string, cost: number) => {
  const ship = state.fleets['1'].ships[shipNumber];
  ship.figurehead = figureheadName;
  state.gold -= cost;
  updateGeneral();
};

export const INVEST_COST_PER_POINT = 20; // 20 gold = +1 industry/economy

const ensurePortInvestment = (portId: string) => {
  if (!state.portInvestments) state.portInvestments = {};
  if (!state.portInvestments[portId]) {
    state.portInvestments[portId] = { economy: 0, industry: 0 };
  }
};

export const investInMarket = (gold: number) => {
  const portId = state.portId!;
  ensurePortInvestment(portId);
  state.gold -= gold;
  state.portInvestments[portId].economy += Math.floor(gold / INVEST_COST_PER_POINT);
  updateGeneral();
};

export const investInShipyard = (gold: number) => {
  const portId = state.portId!;
  ensurePortInvestment(portId);
  state.gold -= gold;
  state.portInvestments[portId].industry += Math.floor(gold / INVEST_COST_PER_POINT);
  updateGeneral();
};

// cost in the original game is economy / 20 + 5
export const CREW_COST = 40;

export const recruitCrew = (amount: number) => {
  let remaining = amount;

  const ships = getPlayerFleet();

  for (let i = 0; i < ships.length; i += 1) {
    if (!remaining) {
      return;
    }

    let assign = shipData[ships[i].id].minimumCrew - ships[i].crew;

    if (assign > remaining) {
      assign = remaining;
    }

    ships[i].crew += assign;
    remaining -= assign;
  }

  state.gold -= amount * CREW_COST;

  updateGeneral();
};

export const setFirstMate = (sailorId: string) => {
  // Player (mates[0]) cannot be assigned as first mate
  if (state.mates[0]?.sailorId === sailorId) return;

  // Clear the current first mate role
  for (const mate of state.mates) {
    if (mate.role === 'firstMate') {
      mate.role = null;
    }
  }

  // Assign the new first mate
  const mate = state.mates.find((m) => m.sailorId === sailorId);
  if (mate) {
    mate.role = 'firstMate';
  }
};

export const defect = (nationalityIndex: number) => {
  state.nationalityIndex = nationalityIndex;
  updateGeneral();
};

export const dismissCrew = (): number => {
  const fleet = getPlayerFleet();
  let freed = 0;
  fleet.forEach((ship, i) => {
    const minCrew = shipData[ship.id].minimumCrew;
    const excess = Math.max(0, ship.crew - minCrew);
    if (excess > 0) {
      state.fleets['1'].ships[i].crew = minCrew;
      freed += excess;
    }
  });
  updateGeneral();
  return freed;
};

export const treatCrew = (cost: number) => {
  state.gold -= cost;
  state.timePassed += 60;
  updateGeneral();
};

export const gambleGold = (amount: number, won: boolean) => {
  state.gold += won ? amount : -amount;
  updateGeneral();
};

export const receiveShipReward = (portId: string, shipId: string, shipName: string) => {
  if (!state.shipRewardsReceived) state.shipRewardsReceived = [];
  state.shipRewardsReceived.push(portId);
  addShip({
    id: shipId,
    name: shipName,
    crew: 0,
    cargo: [],
    durability: shipData[shipId].durability,
  });
  window.localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(state));
  updateGeneral();
};
