import {
  CardinalDirection,
  Direction,
  directionToChanges,
  Position,
} from '../../types';
import { directions, random } from '../../utils';

const TARGET_REACHED_DISTANCE = 5;
const WAYPOINT_REACHED_DISTANCE = 8;

const MAP_W = 2160;

// Manhattan distance with x-wrapping
const wrapDist = (from: Position, to: Position): number => {
  let dx = Math.abs(from.x - to.x);
  if (dx > MAP_W / 2) dx = MAP_W - dx;
  return dx + Math.abs(from.y - to.y);
};

// Greedy best-first: try the direction that minimises Manhattan distance to
// target first; fall back to progressively worse directions until one is clear.
export const bestDirection = (
  from: Position,
  to: Position,
  collision: (pos: Position) => boolean,
): Direction | null => {
  const sorted = ([...directions] as Direction[]).sort((a, b) => {
    const da = directionToChanges[a];
    const db = directionToChanges[b];
    const distA = wrapDist({ x: from.x + da.xDelta, y: from.y + da.yDelta }, to);
    const distB = wrapDist({ x: from.x + db.xDelta, y: from.y + db.yDelta }, to);
    return distA - distB;
  });

  for (const dir of sorted) {
    const { xDelta, yDelta } = directionToChanges[dir];
    if (!collision({ x: from.x + xDelta, y: from.y + yDelta })) {
      return dir;
    }
  }

  return null; // all directions blocked (shouldn't happen in open ocean)
};

const createWorldNpc = (
  position: Position,
  startFrame: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _startDirection: CardinalDirection,
  target: Position,
  collision: (pos: Position) => boolean,
) => {
  let { x, y } = position;

  let xTo = x;
  let yTo = y;

  let frameOffset = 0;
  let frameAlternate = 0;

  const getMovesToSkip = () => random(2, 6);

  let movesToSkip = getMovesToSkip();
  let movesSkipped = 0;

  let currentTarget = target;
  let waypoints: Position[] = [];
  let waypointIndex = 0;

  const animate = () => {
    frameAlternate = frameAlternate === 0 ? 1 : 0;
  };

  // Get the current steering target: next waypoint, or final target
  const getSteeringTarget = (): Position => {
    if (waypointIndex < waypoints.length) {
      return waypoints[waypointIndex];
    }
    return currentTarget;
  };

  return {
    shouldMove: () => {
      if (movesSkipped === movesToSkip) {
        movesToSkip = getMovesToSkip();
        movesSkipped = 0;
        return true;
      }

      movesSkipped += 1;
      return false;
    },
    move: () => {
      // Advance waypoint if close enough
      while (waypointIndex < waypoints.length) {
        if (wrapDist({ x, y }, waypoints[waypointIndex]) < WAYPOINT_REACHED_DISTANCE) {
          waypointIndex++;
        } else {
          break;
        }
      }

      const steerTarget = getSteeringTarget();
      const dir = bestDirection({ x, y }, steerTarget, collision);
      if (dir) {
        const { xDelta, yDelta, frameOffset: newFrameOffset } = directionToChanges[dir];
        frameOffset = newFrameOffset;
        xTo = x + xDelta;
        yTo = y + yDelta;
      }
      animate();
    },
    setTarget: (pos: Position) => {
      currentTarget = pos;
      waypoints = [];
      waypointIndex = 0;
    },
    setRoute: (route: Position[], finalTarget: Position) => {
      currentTarget = finalTarget;
      waypoints = route;
      waypointIndex = 0;
    },
    isNearTarget: () => wrapDist({ x, y }, currentTarget) < TARGET_REACHED_DISTANCE,
    update: () => {
      x = xTo;
      y = yTo;
    },
    position: (percentNextMove = 0) => ({
      x: x + (xTo - x) * percentNextMove,
      y: y + (yTo - y) * percentNextMove,
    }),
    destination: () => ({
      x: xTo,
      y: yTo,
    }),
    frame: () => startFrame + frameOffset + frameAlternate,
    width: 2,
    height: 2,
  };
};

export type WorldNpc = ReturnType<typeof createWorldNpc>;

export default createWorldNpc;
