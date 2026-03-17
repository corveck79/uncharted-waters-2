import type { Position } from '../../types';

const SCALE = 1;    // 1:1 with tilemap — matches player's 1×1 collision exactly
const INFLATE = 0;

type CollisionFn = (pos: Position) => boolean;

export interface CollisionCache {
  data: Uint8Array;
  cols: number;
  rows: number;
}

export const buildCollisionCache = (
  collision: CollisionFn,
  mapCols: number,
  mapRows: number,
): CollisionCache => {
  const cols = Math.ceil(mapCols / SCALE);
  const rows = Math.ceil(mapRows / SCALE);
  const raw = new Uint8Array(cols * rows);

  for (let sy = 0; sy < rows; sy++) {
    for (let sx = 0; sx < cols; sx++) {
      outer: for (let dy = 0; dy < SCALE; dy++) {
        for (let dx = 0; dx < SCALE; dx++) {
          if (collision({ x: sx * SCALE + dx, y: sy * SCALE + dy })) {
            raw[sy * cols + sx] = 1;
            break outer;
          }
        }
      }
    }
  }

  // Inflate obstacles by INFLATE cells (x wraps around world)
  const data = new Uint8Array(cols * rows);
  for (let sy = 0; sy < rows; sy++) {
    for (let sx = 0; sx < cols; sx++) {
      outer: for (let iy = -INFLATE; iy <= INFLATE; iy++) {
        for (let ix = -INFLATE; ix <= INFLATE; ix++) {
          const ny = sy + iy;
          const nx = ((sx + ix) % cols + cols) % cols;
          if (ny >= 0 && ny < rows && raw[ny * cols + nx]) {
            data[sy * cols + sx] = 1;
            break outer;
          }
        }
      }
    }
  }

  return { data, cols, rows };
};

// ── Min-heap helpers ─────────────────────────────────────────────────────────

const heapPush = (heap: number[], item: number, score: Float32Array): void => {
  heap.push(item);
  let i = heap.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (score[heap[p]] <= score[heap[i]]) break;
    const tmp = heap[p]; heap[p] = heap[i]; heap[i] = tmp;
    i = p;
  }
};

const heapPop = (heap: number[], score: Float32Array): number => {
  const top = heap[0];
  const last = heap.pop()!;
  if (heap.length > 0) {
    heap[0] = last;
    let i = 0;
    for (;;) {
      const l = (i << 1) + 1;
      const r = (i << 1) + 2;
      let s = i;
      if (l < heap.length && score[heap[l]] < score[heap[s]]) s = l;
      if (r < heap.length && score[heap[r]] < score[heap[s]]) s = r;
      if (s === i) break;
      const tmp = heap[i]; heap[i] = heap[s]; heap[s] = tmp;
      i = s;
    }
  }
  return top;
};

// ── A* ───────────────────────────────────────────────────────────────────────

const MOVE_DIRS = [
  { dx: 1,  dy: 0,  cost: 1 },
  { dx: -1, dy: 0,  cost: 1 },
  { dx: 0,  dy: 1,  cost: 1 },
  { dx: 0,  dy: -1, cost: 1 },
  { dx: 1,  dy: 1,  cost: Math.SQRT2 },
  { dx: 1,  dy: -1, cost: Math.SQRT2 },
  { dx: -1, dy: 1,  cost: Math.SQRT2 },
  { dx: -1, dy: -1, cost: Math.SQRT2 },
];

const chebyshev = (ax: number, ay: number, bx: number, by: number, cols: number): number => {
  let dx = Math.abs(ax - bx);
  if (dx > cols / 2) dx = cols - dx; // x wraps
  return Math.max(dx, Math.abs(ay - by));
};

export const findPath = (
  from: Position,
  to: Position,
  cache: CollisionCache,
): Position[] => {
  const { data, cols, rows } = cache;
  let sf = { x: Math.floor(from.x / SCALE), y: Math.floor(from.y / SCALE) };
  let st = { x: Math.floor(to.x / SCALE), y: Math.floor(to.y / SCALE) };

  // If start is inside an obstacle (e.g. near port with inflate margin),
  // find nearest clear cell
  if (data[sf.y * cols + sf.x]) {
    let found = false;
    outer: for (let r = 1; r < 15; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = ((sf.x + dx) % cols + cols) % cols;
          const ny = sf.y + dy;
          if (ny >= 0 && ny < rows && !data[ny * cols + nx]) {
            sf = { x: nx, y: ny };
            found = true;
            break outer;
          }
        }
      }
    }
    if (!found) return [to];
  }

  // If target is inside an obstacle, find nearest clear cell
  if (data[st.y * cols + st.x]) {
    let found = false;
    outer: for (let r = 1; r < 15; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = ((st.x + dx) % cols + cols) % cols;
          const ny = st.y + dy;
          if (ny >= 0 && ny < rows && !data[ny * cols + nx]) {
            st = { x: nx, y: ny };
            found = true;
            break outer;
          }
        }
      }
    }
    if (!found) return [to];
  }

  const size = cols * rows;
  const gScore   = new Float32Array(size).fill(Infinity);
  const fScore   = new Float32Array(size);
  const cameFrom = new Int32Array(size).fill(-1);
  const closed   = new Uint8Array(size);

  const startKey = sf.y * cols + sf.x;
  const goalKey  = st.y  * cols + st.x;

  gScore[startKey] = 0;
  fScore[startKey] = chebyshev(sf.x, sf.y, st.x, st.y, cols);

  const openHeap: number[] = [];
  heapPush(openHeap, startKey, fScore);

  while (openHeap.length > 0) {
    const cur = heapPop(openHeap, fScore);
    if (closed[cur]) continue;
    closed[cur] = 1;

    if (cur === goalKey) {
      // Reconstruct raw path
      const raw: Position[] = [];
      let c = goalKey;
      while (c !== startKey && c !== -1) {
        raw.unshift({
          x: (c % cols) * SCALE + SCALE / 2,
          y: Math.floor(c / cols) * SCALE + SCALE / 2,
        });
        c = cameFrom[c];
      }

      raw.push(to);
      return raw;
    }

    const cx = cur % cols;
    const cy = Math.floor(cur / cols);

    for (const { dx, dy, cost } of MOVE_DIRS) {
      const nx = ((cx + dx) % cols + cols) % cols;
      const ny = cy + dy;
      if (ny < 0 || ny >= rows) continue;
      const nk = ny * cols + nx;
      if (data[nk] || closed[nk]) continue;
      const tentative = gScore[cur] + cost;
      if (tentative < gScore[nk]) {
        cameFrom[nk] = cur;
        gScore[nk] = tentative;
        fScore[nk] = tentative + chebyshev(nx, ny, st.x, st.y, cols);
        heapPush(openHeap, nk, fScore);
      }
    }
  }

  return [to]; // no path found — go straight
};
