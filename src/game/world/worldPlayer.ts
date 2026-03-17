import {
  CardinalDirection,
  Direction,
  directionToChanges,
  Position,
} from '../../types';
import getShipSpeed from './shipSpeed';
import state, { Velocity } from '../../state/state';
import { directionMap } from '../../input';
import updateInterface from '../../state/updateInterface';
import { getXWrapAround } from './sharedUtils';
import { getCaptain } from '../../state/selectors';

const createWorldPlayer = (
  startPosition: Position,
  startFrame: number,
  startDirection: CardinalDirection,
) => {
  // Position is ALWAYS an integer tile coordinate
  let position: Position = {
    x: Math.round(startPosition.x),
    y: Math.round(startPosition.y),
  };

  let { frameOffset } = directionToChanges[startDirection];
  let frameAlternate = 0;

  let heading: Direction | '' = '';
  let speed = 0;

  let lastHeading: Direction | '' = '';
  let lastWind: Velocity = {
    direction: 0,
    speed: 0,
  };

  // Integer tile-step state
  let stepTarget: Position | undefined; // target tile (1 tile away)
  let stepFrames = 0;                   // frames elapsed in current step
  let stepDuration = 1;                 // total frames to complete step

  updateInterface.playerFleetDirection(directionMap[heading]);

  const safeWind = (wind: Velocity): Velocity =>
    wind && typeof wind.speed === 'number'
      ? wind
      : { direction: 0, speed: 3 };

  const windUnchanged = (wind: Velocity) =>
    wind.direction === lastWind.direction && wind.speed === lastWind.speed;

  const animate = () => {
    frameAlternate = frameAlternate === 0 ? 1 : 0;
  };

  return {
    /**
     * Integer tile-based movement.
     * Each call either advances an in-progress step or starts a new one.
     * The ship moves exactly 1 tile per step; speed controls step duration.
     */
    move: (
      direction: Direction,
      collisionAt: (position: Position) => boolean,
    ) => {
      const {
        xDelta,
        yDelta,
        frameOffset: newFrameOffset,
      } = directionToChanges[direction];
      frameOffset = newFrameOffset;

      // Step already in progress — advance it
      if (stepTarget) {
        stepFrames++;
        if (stepFrames >= stepDuration) {
          // Complete the step: snap position to target
          position = {
            x: getXWrapAround(stepTarget.x),
            y: stepTarget.y,
          };
          stepTarget = undefined;
        }
        return;
      }

      // Can't move with zero speed (no wind + no oars)
      if (speed <= 0) return;

      // Start a new step
      animate();

      const tx = position.x + xDelta;
      const ty = position.y + yDelta;

      // Simple single-tile collision check
      if (collisionAt({ x: tx, y: ty })) {
        return; // blocked — don't move
      }

      // For diagonal moves, also verify both axis components are passable
      // (prevents cutting through diagonal wall corners)
      const isDiagonal = Math.abs(xDelta) > 0 && Math.abs(yDelta) > 0;
      if (isDiagonal) {
        const xBlocked = collisionAt({ x: position.x + xDelta, y: position.y });
        const yBlocked = collisionAt({ x: position.x, y: position.y + yDelta });
        if (xBlocked && yBlocked) {
          return; // can't squeeze through diagonal gap
        }
      }

      // Begin the step
      stepTarget = { x: tx, y: ty };
      stepFrames = 0;
      stepDuration = Math.max(
        1,
        Math.round((40 / speed) * (isDiagonal ? Math.SQRT2 : 1)),
      );
    },

    /** Apply completed steps (called at start of each game tick) */
    update: () => {
      // Position updates happen inside move() when step completes
    },

    /**
     * Interpolated position for smooth rendering.
     * Returns fractional position between current tile and target tile.
     */
    position: (percentNextMove = 0) => {
      if (!stepTarget) {
        return position;
      }

      const t = Math.min(1, (stepFrames + percentNextMove) / stepDuration);
      return {
        x: getXWrapAround(
          position.x + (stepTarget.x - position.x) * t,
        ),
        y: position.y + (stepTarget.y - position.y) * t,
      };
    },

    destination: () => stepTarget,

    /** Snap to nearest water tile and move 1 tile (collision-aware) */
    forceMove: (direction: Direction, collisionAt: (position: Position) => boolean) => {
      animate();
      // Cancel any in-progress step
      stepTarget = undefined;

      const snappedX = Math.round(position.x);
      const snappedY = Math.round(position.y);
      position = { x: snappedX, y: snappedY };

      // Try heading direction first, then rotate ±45°, ±90°, etc.
      const dirs: Direction[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
      const idx = dirs.indexOf(direction);
      const tryOrder = [0, 1, -1, 2, -2, 3, -3, 4];

      for (const offset of tryOrder) {
        const tryDir = dirs[((idx + offset) % 8 + 8) % 8];
        const { xDelta, yDelta, frameOffset: newFrameOffset } = directionToChanges[tryDir];
        const targetX = snappedX + xDelta;
        const targetY = snappedY + yDelta;

        if (!collisionAt({ x: targetX, y: targetY })) {
          frameOffset = newFrameOffset;
          // Instant move (no interpolation — escape stuck immediately)
          position = { x: targetX, y: targetY };
          return;
        }
      }
    },

    setHeading: (newHeading: Direction | '') => {
      if (newHeading === heading) {
        return;
      }

      heading = newHeading;

      updateInterface.playerFleetDirection(directionMap[heading]);
    },
    heading: () => heading,
    updateSpeed: () => {
      const wind = safeWind(state.wind);
      if (heading === lastHeading && windUnchanged(wind)) {
        return;
      }

      const ship = state.fleets[1].ships[0];

      speed = heading
        ? getShipSpeed(ship, getCaptain(0), directionMap[heading], wind)
        : 0;

      lastHeading = heading;
      lastWind = state.wind;
      updateInterface.playerFleetSpeed(speed);
    },
    speed: () => speed,
    frame: () => startFrame + frameOffset + frameAlternate,
    width: 2,
    height: 2,
  };
};

export type WorldPlayer = ReturnType<typeof createWorldPlayer>;

export default createWorldPlayer;
