import Input from '../../input';
import type { Position } from '../../types';
import { Map } from '../../map';
import createWorldPlayer from './worldPlayer';
import createWorldNpc, { WorldNpc } from './worldNpc';
import state from '../../state/state';
import type { Ship } from './fleets';
import { hasOars } from './worldUtils';
import { dock } from '../../state/actionsWorld';
import { positionAdjacentToPort } from '../../state/selectors';
import { regularPorts } from '../../data/portData';

const FRAMES_PER_SHIP = 8;
const SHIP_VARIANTS = 2;

export const getStartFrame = (flagship: Ship, isPlayer = false) => {
  const startFrame = hasOars(flagship.id) ? 0 : FRAMES_PER_SHIP;

  return isPlayer ? startFrame : startFrame + FRAMES_PER_SHIP * SHIP_VARIANTS;
};

const randomPortTarget = (): Position => {
  const portId = String(Math.floor(Math.random() * regularPorts.length) + 1);
  return positionAdjacentToPort(portId);
};

const createWorldCharacters = (map: Map) => {
  const playerFleet = state.fleets[1];

  if (!playerFleet.position) {
    throw Error('Player fleet has no position');
  }

  const player = createWorldPlayer(
    playerFleet.position,
    getStartFrame(playerFleet.ships[0], true),
    'n',
  );

  const collision = (position: Position) => map.collisionAt(position);

  const npcs: WorldNpc[] = [];

  for (let id = 2; id <= Object.keys(state.fleets).length; id += 1) {
    const { position, ships } = state.fleets[id];

    if (!position) {
      throw Error('NPC fleet has no position');
    }

    npcs.push(
      createWorldNpc(position, getStartFrame(ships[0]), 'n', randomPortTarget(), collision),
    );
  }

  return {
    update: () => {
      player.update();

      if (Input.getPressedE() && dock(player.position())) {
        npcs.forEach((npc, i) => {
          const fleetId = String(i + 2);
          if (state.fleets[fleetId]) {
            state.fleets[fleetId].position = npc.position();
          }
        });
        player.setHeading('');
        return false;
      }

      const direction = Input.getDirection({ includeOrdinal: true });

      // this check allows the player to keep their heading even after releasing input
      if (direction) {
        player.setHeading(direction);
      }

      player.updateSpeed();

      const heading = player.heading();

      if (heading) {
        player.move(heading, collision);
      }

      npcs.forEach((npc) => {
        npc.update();

        if (!npc.shouldMove()) {
          return;
        }

        // Pick a new random port when close enough to the current target
        if (npc.isNearTarget()) {
          npc.setTarget(randomPortTarget());
        }

        npc.move();
      });

      return !!heading;
    },
    player: () => player,
    npcs: () => npcs,
  };
};

export type WorldCharacters = ReturnType<typeof createWorldCharacters>;

export default createWorldCharacters;
