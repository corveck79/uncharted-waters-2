import Input from '../../input';

import { Position } from '../../types';
import { Map } from '../../map';
import { Building } from '../../building';
import createPlayer, { PortPlayer } from './portPlayer';
import createNpc, { PortNpc } from './portNpc';
import { applyPositionDelta } from '../../utils';
import {
  getStartFrame,
  portNpcData,
  portPlayerData,
  portCharacterType,
} from '../../data/portCharactersData';
import { isPortBlockaded } from '../../state/selectors';
import { getPlayerSailorId } from '../../state/selectors';

const createPortCharacters = (
  map: Map,
  building: Building,
  isSupplyPort: boolean,
) => {
  const { spawn } = portPlayerData;

  // Determine which port character type to use based on the selected sailor
  const sailorId = getPlayerSailorId();
  const SAILOR_TO_PORT_TYPE: Record<string, typeof portCharacterType[number]> = {
    '2': 'OTTO',   // Otto Baynes – green-scheme recolor
    '3': 'CATALINA', // Catalina Erantzo – red-scheme WOMAN recolor
    '4': 'ERNST',  // Ernst von Bohr – pink/magenta-scheme recolor
    '5': 'PIETRO', // Pietro Conti – warm red-scheme recolor
    '6': 'ALI',    // Ali Vezas – green-scheme MAN recolor
  };
  const playerType = SAILOR_TO_PORT_TYPE[sailorId] || 'PLAYER';

  const player = createPlayer(
    applyPositionDelta(building.get(spawn.buildingId), spawn.offset),
    getStartFrame(playerType),
    's',
  );

  const npcs: PortNpc[] = [];

  const collisionOthersAt = (position: Position, self: PortPlayer | PortNpc) =>
    [player, ...npcs].some((character) => {
      if (character === self) {
        return false;
      }

      const { x, y } = position;
      const { x: xOther, y: yOther } =
        character.destination() || character.position();

      const distanceX = Math.abs(x - xOther);
      const distanceY = Math.abs(y - yOther);

      return distanceX < 2 && distanceY < 2;
    });

  const collisionAt = (position: Position, self: PortPlayer | PortNpc) =>
    map.collisionAt(position) || collisionOthersAt(position, self);

  return {
    update: () => {
      player.update();

      npcs.forEach((npc) => {
        npc.update();
      });

      /*
        When entering a building, we want the movement towards the door to
        be rendered.

        At the same time, we want to prevent the rare case where an NPC could
        be blocking when we exit. To accomplish this, NPC movement is skipped
        both when entering and exiting.
       */
      if (player.enteredBuilding()) {
        return;
      }

      const direction = Input.getDirection({ includeOrdinal: false });

      if (direction) {
        player.move(direction, (position: Position) =>
          collisionAt(position, player),
        );
      }

      if (player.willEnterBuilding(building.at)) {
        return;
      }

      npcs.forEach((npc) => {
        if (npc.shouldMove()) {
          npc.move((position: Position) => collisionAt(position, npc));
        }
      });
    },
    spawnNpcs: () => {
      if (npcs.length || isSupplyPort) {
        return;
      }

      const blockaded = isPortBlockaded();

      portNpcData
        .filter((npc) => (blockaded ? npc.type === 'GUARD' : npc.type !== 'GUARD'))
        .forEach((npc) => {
          const { type: npcId, spawn: npcSpawn, isStationary = false } = npc;

          npcs.push(
            createNpc(
              applyPositionDelta(
                building.get(npcSpawn.buildingId),
                npcSpawn.offset,
              ),
              getStartFrame(npcId),
              's',
              isStationary,
            ),
          );
        });
    },
    despawnNpcs: () => {
      while (npcs.length) {
        npcs.pop();
      }
    },
    player: () => player,
    npcs: () => npcs,
  };
};

export default createPortCharacters;
