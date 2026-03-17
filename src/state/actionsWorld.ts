import state, { SAVED_STATE_KEY } from './state';
import { portAdjacentAt } from '../game/port/portUtils';
import createPort from '../game/port/port';
import Input from '../input';
import updateInterface from './updateInterface';
import { updateGeneral } from './actionsPort';
import { regularPorts } from '../data/portData';
import type { Position } from '../types';

const FIGUREHEAD_RANK: Record<string, number> = {
  'Sea Horse': 1, 'Commodore': 2, 'Unicorn': 3, 'Lion': 4,
  'Giant Eagle': 5, 'Hero': 6, 'Neptune': 7, 'Dragon': 8,
  'Angel': 9, 'Goddess': 10,
};
const STORM_BASE_CHANCE = 0.10;   // 10% per day at sea
const STORM_RANK_REDUCTION = 0.008; // 0.8% reduction per figurehead rank
import {
  getCurrent,
  getIsSummer,
  getSeaArea,
  getWind,
} from '../game/world/windCurrent';
import { START_DATE } from '../constants';
import {
  getTimeOfDay,
  isPortBlockaded,
  positionAdjacentToPort,
  shouldUpdateWorldStatus,
} from './selectors';
import { discoveryData, type DiscoveryId } from '../data/discoveryData';

// ── Auto-sail state (non-persistent, module-level) ───────────────────────────
let _autoSailTarget: { position: Position; portId: string } | null = null;

export const setAutoSailTarget = (portId: string) => {
  const port = regularPorts[parseInt(portId, 10) - 1];
  _autoSailTarget = { position: positionAdjacentToPort(portId), portId };
  if (port) {
    updateInterface.notification(
      'Auto Sail',
      `Setting course for ${port.name}. Steer manually to cancel.`,
    );
  }
};

export const clearAutoSailTarget = () => {
  _autoSailTarget = null;
};

export const getAutoSailTarget = () => _autoSailTarget;

export const dock = (position: Position) => {
  const portId = portAdjacentAt(position);

  if (!portId) {
    return false; // TODO show message
  }

  // NPC fleet positions are synced to state.fleets in worldCharacters.ts
  // immediately after dock() returns, so they are included in any save.
  const playerFleet = state.fleets[1];

  if (playerFleet.position) {
    playerFleet.position = position;
  }

  state.port = createPort(portId);
  state.portId = portId;

  Input.reset();

  updateGeneral();

  state.dayAtSea = 0;
  updateInterface.dayAtSea(state.dayAtSea);

  // Notify player when entering a blockaded port
  if (isPortBlockaded()) {
    updateInterface.notification(
      'Hostile Port',
      'This port is under foreign control. Armed soldiers patrol the streets. Proceed with caution.',
    );
  }

  return true;
};

const updateProvisions = () => {
  const provisions = {
    water: 0,
    food: 0,
    lumber: 0,
    shot: 0,
  };

  const playerFleet = state.fleets[1];

  playerFleet.ships.forEach((ship) => {
    ship.cargo.forEach((item) => {
      if (item.type in provisions) {
        provisions[item.type] += item.quantity;
      }
    });
  });

  updateInterface.provisions(provisions);
};

export const updateWorldStatus = () => {
  const { position } = state.fleets['1'];

  if (!position) {
    throw Error('Player fleet position is not set');
  }

  const seaArea = getSeaArea(position);

  const wind = getWind(seaArea, getIsSummer(START_DATE, state.timePassed));
  const current = getCurrent(seaArea);

  state.wind = wind;
  state.current = current;

  updateInterface.indicators({
    wind,
    current,
  });
};

export const worldTimeTick = () => {
  state.timePassed += 20;

  if (shouldUpdateWorldStatus()) {
    updateWorldStatus();
  }

  if (getTimeOfDay() === 0) {
    updateGeneral();

    state.dayAtSea += 1;
    updateInterface.dayAtSea(state.dayAtSea);

    // Daily storm roll — reduced by flagship figurehead rank
    const flagship = state.fleets['1'].ships[0];
    if (flagship) {
      const rank = flagship.figurehead ? (FIGUREHEAD_RANK[flagship.figurehead] ?? 0) : 0;
      const stormChance = Math.max(0.02, STORM_BASE_CHANCE - rank * STORM_RANK_REDUCTION);
      if (Math.random() < stormChance) {
        flagship.durability = Math.max(0, flagship.durability - 10);
        updateInterface.notification(
          'Storm!',
          'A fierce storm batters your fleet! Your flagship takes damage.',
        );
      }
    }
  }
};

/*
  While fleets under normal circumstances always have a position even when
  docked, there are two exceptions:
    - The player at the start of the game
    - NPC sailors who have respawned
 */
export const setDockedFleetPositions = () => {
  const playerFleet = state.fleets[1];

  if (!playerFleet.position) {
    if (state.portId === null) {
      throw Error('Player fleet must start with a position if not in port');
    }

    playerFleet.position = positionAdjacentToPort(state.portId);
  }

  Object.entries(state.fleets).forEach(([id, fleet]) => {
    if (id === '1' || fleet.position) return;
    const randomPortId = String(
      Math.floor(Math.random() * regularPorts.length) + 1,
    );
    fleet.position = positionAdjacentToPort(randomPortId);
  });
};

export const setSail = () => {
  state.portId = null;
  state.buildingId = null;

  updateWorldStatus();

  Input.reset();

  window.localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(state));
  updateGeneral();
  updateProvisions();
};

export const triggerDiscovery = (id: DiscoveryId) => {
  if ((state.discoveries ?? []).includes(id)) return;
  state.discoveries = [...(state.discoveries ?? []), id];
  const item = discoveryData[id];
  state.fame = {
    ...state.fame,
    adventure: (state.fame?.adventure ?? 0) + item.adventureFame,
  };
  window.localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(state));
  updateInterface.notification(item.name, `${item.description}\n\nAdventure fame +${item.adventureFame}.`);
};
