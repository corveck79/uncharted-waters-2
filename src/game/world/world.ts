import Assets from '../../assets';
import createMap from '../../map';
import PercentNextMove from '../../percentNextMove';
import createWorldCharacters from './worldCharacters';
import { getTimeOfDay } from '../../state/selectors';
import { worldTimeTick, updateWorldStatus } from '../../state/actionsWorld';
import { drawCamera, drawCharacter, getCameraPosition, getFromToAccountingForWrapAround } from './sharedUtils';
import { TILE_SIZE } from '../../constants';
import { getAutoSailTarget } from '../../state/actionsWorld';

const createWorld = () => {
  const canvas = document.getElementById('camera') as HTMLCanvasElement;
  const context = canvas.getContext('2d', { alpha: false })!;

  const width = canvas.width / TILE_SIZE;
  const height = canvas.height / TILE_SIZE;

  const map = createMap([Math.ceil(width + 1), Math.ceil(height + 1)]);

  // Ensure wind/current are initialized (saved state from older versions may lack them)
  updateWorldStatus();

  const characters = createWorldCharacters(map);

  return {
    update: () => {
      PercentNextMove.update();

      if (PercentNextMove.get() !== 0) {
        return;
      }

      const moved = characters.update();

      if (moved) {
        worldTimeTick();
      }
    },
    draw: () => {
      const player = characters.player();
      const camera = getCameraPosition(
        player,
        { width, height },
        map,
        PercentNextMove.get(),
        true,
      );

      drawCamera(context, { ...camera, width, height }, map, getTimeOfDay());

      // Draw auto-sail route overlay
      const autoTarget = getAutoSailTarget();
      if (autoTarget) {
        const { path, index } = characters.autoSailRoute();
        const playerPos = player.position(PercentNextMove.get());

        // Build full route: player position → remaining waypoints → target
        const routePoints = [playerPos, ...path.slice(index), autoTarget.position];

        context.save();
        context.strokeStyle = 'rgba(255, 220, 80, 0.6)';
        context.lineWidth = 2;
        context.setLineDash([6, 4]);
        context.beginPath();

        for (let i = 0; i < routePoints.length; i++) {
          const screenX = getFromToAccountingForWrapAround(camera.x, routePoints[i].x) * TILE_SIZE;
          const screenY = (routePoints[i].y - camera.y) * TILE_SIZE;

          if (i === 0) {
            context.moveTo(screenX, screenY);
          } else {
            context.lineTo(screenX, screenY);
          }
        }

        context.stroke();

        // Draw target marker (small circle at destination)
        const targetScreenX = getFromToAccountingForWrapAround(camera.x, autoTarget.position.x) * TILE_SIZE;
        const targetScreenY = (autoTarget.position.y - camera.y) * TILE_SIZE;
        context.beginPath();
        context.arc(targetScreenX, targetScreenY, 5, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 220, 80, 0.8)';
        context.fill();
        context.restore();
      }

      const npcs = characters.npcs();

      npcs.forEach((npc) => {
        drawCharacter(
          context,
          Assets.images('worldShips'),
          npc,
          camera,
          PercentNextMove.get(),
        );
      });

      // player drawn last as there’s no collision at sea
      drawCharacter(
        context,
        Assets.images('worldShips'),
        player,
        camera,
        PercentNextMove.get(),
      );
    },
    characters: () => characters,
  };
};

export type World = ReturnType<typeof createWorld>;

export default createWorld;
