import {
  CardinalDirection,
  Direction,
  directionToChanges,
  Position,
} from '../../types';
import { directions, random } from '../../utils';

const TARGET_REACHED_DISTANCE = 5;

// Greedy best-first: try the direction that minimises Manhattan distance to
// target first; fall back to progressively worse directions until one is clear.
const bestDirection = (
  from: Position,
  to: Position,
  collision: (pos: Position) => boolean,
): Direction | null => {
  const sorted = ([...directions] as Direction[]).sort((a, b) => {
    const da = directionToChanges[a];
    const db = directionToChanges[b];
    const distA = Math.abs(from.x + da.xDelta - to.x) + Math.abs(from.y + da.yDelta - to.y);
    const distB = Math.abs(from.x + db.xDelta - to.x) + Math.abs(from.y + db.yDelta - to.y);
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

  const animate = () => {
    frameAlternate = frameAlternate === 0 ? 1 : 0;
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
      const dir = bestDirection({ x, y }, currentTarget, collision);
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
    },
    isNearTarget: () =>
      Math.abs(x - currentTarget.x) + Math.abs(y - currentTarget.y) <
      TARGET_REACHED_DISTANCE,
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
