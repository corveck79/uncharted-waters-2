import state, { Role } from './state';
import generateUsedShips from '../interface/port/shipyard/generateUsedShips';
import type { QuestId } from '../interface/quest/questData';
import { getPortData } from '../game/port/portUtils';
import { itemData, ItemId, isWeapon, isArmor } from '../data/itemData';
import { getPlayerFleet } from './selectorsFleet';
import createMap from '../map';
import { applyPositionDelta } from '../utils';
import getSailor from '../data/sailorData';
import { playerCharacters } from '../data/playerCharacters';
import { provisions } from '../game/world/fleets';
import { shipData } from '../data/shipData';
import { shipyardsToShips } from '../data/portShipyardData';
import type { GoodsId } from '../data/goodsData';
import { discoveryData, allDiscoveryIds, type DiscoveryId, DISCOVERY_DETECTION_RADIUS } from '../data/discoveryData';

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
    console.warn('No adjacent tile found for port', portId, '- falling back to port position');
    return position;
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
export const getGoldCoins = () => state.gold % 10000;
export const getGoldIngots = () => Math.floor(state.gold / 10000);
export const getFame = () => state.fame ?? { trade: 0, piracy: 0, adventure: 0 };
export const getFriendship = () => state.friendship ?? { portugal: 0, spain: 0, turkey: 0, england: 0, italy: 0, holland: 0 };

export const getSavings = () => state.savings;

const CREDIT_LINE = 1000;

export const getCreditLine = () => Math.max(0, CREDIT_LINE - state.debt);

export const getDebt = () => state.debt;

export const getRepayAmount = () => Math.min(state.debt, state.gold);

export const getAtMosque = () => {
  if (!state.portId) return false;
  const port = getPortData(state.portId);
  if (port.tileset !== 2) return false;
  // Only non-Muslims are blocked from entering the mosque
  return getPlayerReligion() !== 'muslim';
};

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

export const canBuyItem = (itemId: ItemId): boolean => {
  if (isWeapon(itemId)) {
    return !state.items.some((id) => isWeapon(id));
  }
  if (isArmor(itemId)) {
    return !state.items.some((id) => isArmor(id));
  }
  return true;
};

export const getMates = () =>
  state.mates.map((mate) => ({
    ...mate,
    ...getSailor(mate.sailorId),
  }));

export const getCaptain = (shipI: number) => {
  // Ship 0 (flagship) captain is the mate with role === null (Navigator of flagship)
  const roleToFind = shipI === 0 ? null : shipI;
  const mate = state.mates.find(({ role }) => role === roleToFind);

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

export const getFirstMateId = () =>
  state.mates.find(({ role }) => role === 'firstMate')?.sailorId ?? state.mates[0]?.sailorId ?? '1';

export const getPlayerSailorId = () => state.mates[0]?.sailorId ?? '1';

export const getPlayerReligion = (): string => {
  const sailorId = getPlayerSailorId();
  const char = playerCharacters.find(c => c.sailorId === sailorId);
  return char?.religion ?? 'christian';
};

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

export const getCurrentPortId = () => state.portId;

export const getCurrentMarketId = () => {
  if (!state.portId) return '1';
  const port = getPortData(state.portId);
  if (port.isSupplyPort) return '1';
  return port.marketId;
};

export const getPortInvestment = (portId: string) =>
  state.portInvestments?.[portId] || { economy: 0, industry: 0 };

export const getEffectiveIndustry = (portId: string) => {
  const port = getPortData(portId);
  if (port.isSupplyPort) return 0;
  return port.industry + getPortInvestment(portId).industry;
};

export const getEffectiveEconomy = (portId: string) => {
  const port = getPortData(portId);
  if (port.isSupplyPort) return 0;
  return port.economy + getPortInvestment(portId).economy;
};

export const getNewShipsAvailable = () => {
  if (!state.portId) return [];
  const port = getPortData(state.portId);
  if (port.isSupplyPort) return [];
  const industry = getEffectiveIndustry(state.portId);

  // Use per-port ships list if available
  if ((port as any).ships && (port as any).ships.length > 0) {
    return (port as any).ships
      .map((shipId: string) => ({ shipId, industryRequirement: shipData[shipId]?.industryRequirement ?? 0 }))
      .filter((s: any) => s.industryRequirement <= industry);
  }

  // Fall back to industryId group
  const { industryId } = port;
  return (shipyardsToShips[industryId] || []).filter(
    (ship) => ship.industryRequirement <= industry,
  );
};

// Player nationality index: maps sailorId to the allegiance array index used in portData.ts.
// portData allegiance ordering: [Portugal=0, Spain=1, Ottoman=2, England=3, Italy=4, Holland=5]
const SAILOR_ID_TO_ALLEGIANCE_INDEX: { [key: string]: number } = {
  '1': 0, // João  – Portugal
  '2': 3, // Otto  – England
  '3': 1, // Catalina – Spain
  '4': 5, // Ernst – Holland
  '5': 4, // Pietro – Italy
  '6': 2, // Ali   – Ottoman
};

export const getPlayerNationalityIndex = (): number => {
  if (state.nationalityIndex !== undefined) return state.nationalityIndex;
  const playerSailorId = state.mates[0]?.sailorId;
  const idx = SAILOR_ID_TO_ALLEGIANCE_INDEX[playerSailorId];
  return idx !== undefined ? idx : 0;
};

export const isPortBlockaded = (): boolean => {
  if (!state.portId) return false;
  const port = getPortData(state.portId);
  if (port.isSupplyPort) return false;

  const { allegiances } = port;
  const maxAllegiance = Math.max(...allegiances);
  if (maxAllegiance < 50) return false;

  const dominantIdx = allegiances.indexOf(maxAllegiance);
  return dominantIdx !== getPlayerNationalityIndex();
};

const ALLEGIANCE_TO_NATION: { [key: number]: string } = {
  0: 'Portugal', 1: 'Spain', 2: 'Ottoman Empire', 3: 'England', 4: 'Italy', 5: 'Holland',
};

const ALLEGIANCE_TO_FRIENDSHIP_KEY: { [key: number]: keyof typeof state.friendship } = {
  0: 'portugal', 1: 'spain', 2: 'turkey', 3: 'england', 4: 'italy', 5: 'holland',
};

export const getBlockadeInfo = (): { nation: string; friendly: boolean } | null => {
  if (!isPortBlockaded()) return null;
  const port = getPortData(state.portId!);
  const maxAllegiance = Math.max(...port.allegiances);
  const dominantIdx = port.allegiances.indexOf(maxAllegiance);
  const nation = ALLEGIANCE_TO_NATION[dominantIdx] ?? 'Unknown';
  const friendshipKey = ALLEGIANCE_TO_FRIENDSHIP_KEY[dominantIdx];
  const friendly = friendshipKey ? (state.friendship?.[friendshipKey] ?? 0) >= 50 : false;
  return { nation, friendly };
};

export const getDiscoveries = (): DiscoveryId[] => state.discoveries ?? [];

export const hasDiscovery = (id: DiscoveryId): boolean =>
  (state.discoveries ?? []).includes(id);

export const getDiscoveryCount = (): number => (state.discoveries ?? []).length;

export const getTotalDiscoveries = (): number => allDiscoveryIds.length;

/** Returns the id of a discovery item the player is close enough to trigger, or null. */
export const getNearbyUndiscoveredItem = (): DiscoveryId | null => {
  const worldPos = state.world?.playerPosition;
  if (!worldPos) return null;
  const discovered = state.discoveries ?? [];

  for (const id of allDiscoveryIds) {
    if (discovered.includes(id)) continue;
    const item = discoveryData[id];
    const dx = worldPos.x - item.worldX;
    const dy = worldPos.y - item.worldY;
    if (Math.sqrt(dx * dx + dy * dy) <= DISCOVERY_DETECTION_RADIUS) {
      return id;
    }
  }
  return null;
};
