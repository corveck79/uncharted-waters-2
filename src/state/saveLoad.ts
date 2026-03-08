import state, { SAVED_STATE_KEY } from './state';
import { regularPorts } from '../data/portData';
import { getDate } from '../interface/interfaceUtils';

const SAVE_SLOT_PREFIX = 'save_slot_';
export const NUM_SLOTS = 3;

interface SaveSlotData {
  meta: {
    savedAt: number;
    portId: string | null;
    timePassed: number;
  };
  gameState: object;
}

export interface SaveSlot {
  index: number;
  savedAt: number | null;
  portName: string | null;
  gameDate: string | null;
}

function getSerializableState(): object {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { world, port, ...rest } = state as any;
  return rest;
}

export function getSaveSlots(): SaveSlot[] {
  return Array.from({ length: NUM_SLOTS }, (_, i) => {
    const raw = window.localStorage.getItem(`${SAVE_SLOT_PREFIX}${i}`);

    if (!raw) {
      return { index: i, savedAt: null, portName: null, gameDate: null };
    }

    try {
      const data: SaveSlotData = JSON.parse(raw);
      const { portId, timePassed, savedAt } = data.meta;
      const portIndex = portId ? parseInt(portId, 10) - 1 : -1;
      const portName =
        portIndex >= 0 ? regularPorts[portIndex]?.name ?? 'At Sea' : 'At Sea';

      return {
        index: i,
        savedAt,
        portName,
        gameDate: getDate(timePassed),
      };
    } catch {
      return { index: i, savedAt: null, portName: null, gameDate: null };
    }
  });
}

export function saveToSlot(slotIndex: number): void {
  const data: SaveSlotData = {
    meta: {
      savedAt: Date.now(),
      portId: state.portId,
      timePassed: state.timePassed,
    },
    gameState: getSerializableState(),
  };

  window.localStorage.setItem(
    `${SAVE_SLOT_PREFIX}${slotIndex}`,
    JSON.stringify(data),
  );
}

export function loadFromSlot(slotIndex: number): void {
  const raw = window.localStorage.getItem(`${SAVE_SLOT_PREFIX}${slotIndex}`);

  if (!raw) return;

  const data: SaveSlotData = JSON.parse(raw);
  window.localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(data.gameState));
  window.location.reload();
}

export function deleteSlot(slotIndex: number): void {
  window.localStorage.removeItem(`${SAVE_SLOT_PREFIX}${slotIndex}`);
}
