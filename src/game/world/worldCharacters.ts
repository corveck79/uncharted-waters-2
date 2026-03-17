import Input from '../../input';
import { type Direction, type Position, directionToChanges } from '../../types';
import { Map } from '../../map';
import createWorldPlayer from './worldPlayer';
import createWorldNpc, { WorldNpc } from './worldNpc';
import state from '../../state/state';
import type { Ship } from './fleets';
import { hasOars } from './worldUtils';
import { dock, triggerDiscovery, getAutoSailTarget, clearAutoSailTarget } from '../../state/actionsWorld';
import { positionAdjacentToPort } from '../../state/selectors';
import { buildCollisionCache, findPath, type CollisionCache } from './worldPathfinder';
import { regularPorts } from '../../data/portData';
import { allDiscoveryIds, discoveryData, DISCOVERY_DETECTION_RADIUS } from '../../data/discoveryData';
import { startBattle } from '../../state/actionsBattle';
import type { EnemyType } from '../../data/battleData';
import { getRoute, ROUTE_PORT_COUNT } from '../../data/precomputedRoutes';

const FRAMES_PER_SHIP = 8;
const SHIP_VARIANTS = 2;

const BATTLE_TRIGGER_RADIUS = 2;
const ENEMY_TYPES: EnemyType[] = ['pirate', 'corsair', 'warship', 'rival', 'merchant'];

const MAP_W = 2160;

export const getStartFrame = (flagship: Ship, isPlayer = false) => {
  const startFrame = hasOars(flagship.id) ? 0 : FRAMES_PER_SHIP;

  return isPlayer ? startFrame : startFrame + FRAMES_PER_SHIP * SHIP_VARIANTS;
};

const randomPortIndex = (): number =>
  Math.floor(Math.random() * Math.min(regularPorts.length, ROUTE_PORT_COUNT));

// Find closest port index (0-based) to a world position
const closestPortIndex = (pos: Position): number => {
  let best = 0;
  let bestDist = Infinity;
  const count = Math.min(regularPorts.length, ROUTE_PORT_COUNT);
  for (let i = 0; i < count; i++) {
    const p = regularPorts[i].position;
    let dx = Math.abs(pos.x - p.x);
    if (dx > MAP_W / 2) dx = MAP_W - dx;
    const dist = dx + Math.abs(pos.y - p.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
};

// 8 compass directions in clockwise order
const COMPASS: Direction[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

// Pick the best compass direction from `from` toward `to`, handling x-wrap
const posToCompass = (from: Position, to: Position): Direction => {
  let dx = to.x - from.x;
  if (dx > MAP_W / 2) dx -= MAP_W;
  if (dx < -MAP_W / 2) dx += MAP_W;
  const dy = to.y - from.y;
  // atan2(dy,dx): 0=east, PI/2=south, -PI/2=north
  const angle = Math.atan2(dy, dx);
  // Map to compass index: e=0, se=1, s=2, sw=3, w=4, nw=5, n=6, ne=7
  const raw = Math.round(angle / (Math.PI / 4));
  const atan2Dirs: Direction[] = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
  return atan2Dirs[((raw % 8) + 8) % 8];
};

// Rotate a compass direction by `steps` positions (positive = clockwise)
const rotateCompass = (dir: Direction, steps: number): Direction => {
  const idx = COMPASS.indexOf(dir);
  return COMPASS[((idx + steps) % 8 + 8) % 8];
};

const createWorldCharacters = (map: Map) => {
  const playerFleet = state.fleets[1];

  if (!playerFleet.position) {
    throw Error('Player fleet has no position');
  }

  if (!playerFleet.ships[0]) {
    throw Error('Player fleet has no flagship');
  }

  const player = createWorldPlayer(
    playerFleet.position,
    getStartFrame(playerFleet.ships[0], true),
    'n',
  );

  const collision = (position: Position) => map.collisionAt(position);
  const narrowCollision = (position: Position) => map.tileIsLand(position);

  // Use 1×1 (single-tile) collision for player on the world map.
  // The 2×2 footprint is too wide for narrow straits (Gibraltar, Antwerp channel,
  // Dardanelles, etc.) and causes the ship to get stuck. 1×1 matches the
  // pre-computed route collision model and the original SNES behavior.
  const playerCollision = narrowCollision;

  // Stuck detection: track cumulative progress over N frames.
  // If ship hasn't moved MIN_PROGRESS tiles in CHECK_INTERVAL frames, forceMove.
  let stuckCheckX = 0;
  let stuckCheckY = 0;
  let stuckTimer = 0;
  const STUCK_CHECK_INTERVAL = 8;
  const STUCK_MIN_PROGRESS = 0.5;

  // A* pathfinding state
  let collisionCache: CollisionCache | null = null;
  let autoPath: Position[] = [];
  let autoPathIndex = 0;
  let lastAutoPortId: string | null = null;

  const WAYPOINT_RADIUS = 3;

  // Stuck recovery: track distance to waypoint
  let bestDist = Infinity;
  let stuckFrames = 0;
  let rotateStep = 0;         // 0 = no rotation, 1..7 = alternating cw/ccw offsets

  const STUCK_ROTATE_INTERVAL = 2;   // try next rotation every 2 stuck frames
  const STUCK_SKIP_THRESHOLD = 15;   // skip waypoint after 15 stuck frames

  const resetStuck = () => {
    bestDist = Infinity;
    stuckFrames = 0;
    rotateStep = 0;
  };

  const getCache = (): CollisionCache => {
    if (!collisionCache) {
      collisionCache = buildCollisionCache(narrowCollision, map.tilemapColumns, map.tilemapRows);
    }
    return collisionCache;
  };

  const PATH_SCALE = 1; // must match worldPathfinder SCALE

  // Pre-cache water positions for all regular ports (avoids repeated createMap calls)
  const portCount = Math.min(regularPorts.length, ROUTE_PORT_COUNT);
  const portWaterCache: Position[] = [];
  for (let i = 0; i < portCount; i++) {
    portWaterCache.push(positionAdjacentToPort(String(i + 1)));
  }

  // Pick a random port target, returning its index and cached water position
  const pickRandomPort = (): { idx: number; pos: Position } => {
    const idx = randomPortIndex();
    return { idx, pos: portWaterCache[idx] };
  };

  const npcs: WorldNpc[] = [];
  // Track which port each NPC is heading to (0-based index)
  const npcTargetPort: number[] = [];

  for (let id = 2; id <= Object.keys(state.fleets).length; id += 1) {
    const { position, ships } = state.fleets[id];

    if (!position) {
      throw Error('NPC fleet has no position');
    }

    const fromIdx = closestPortIndex(position);
    const { idx: toIdx, pos: targetPos } = pickRandomPort();
    const route = getRoute(fromIdx, toIdx);

    const npc = createWorldNpc(position, getStartFrame(ships[0]), 'n', targetPos, collision);
    if (route) {
      npc.setRoute(route, targetPos);
    }
    npcTargetPort.push(toIdx);
    npcs.push(npc);
  }

  return {
    update: () => {
      // If in battle, pause all world input but keep NPC positions
      if (state.battle) {
        return false;
      }

      player.update();

      // Check for nearby discovery items
      const pos = player.position();
      const discovered = state.discoveries ?? [];
      for (const id of allDiscoveryIds) {
        if (discovered.includes(id)) continue;
        const item = discoveryData[id];
        const dx = pos.x - item.worldX;
        const dy = pos.y - item.worldY;
        if (Math.sqrt(dx * dx + dy * dy) <= DISCOVERY_DETECTION_RADIUS) {
          triggerDiscovery(id);
          break;
        }
      }

      const dockAndSyncNpcs = (dockPos: { x: number; y: number }) => {
        if (!dock(dockPos)) return false;
        npcs.forEach((npc, i) => {
          const fleetId = String(i + 2);
          if (state.fleets[fleetId]) {
            state.fleets[fleetId].position = npc.position();
          }
        });
        player.setHeading('');
        return true;
      };

      if (Input.getPressedE() && dockAndSyncNpcs(player.position())) {
        return false;
      }

      const manualDir = Input.getDirection({ includeOrdinal: true });
      const autoTarget = getAutoSailTarget();

      if (manualDir) {
        // Manual input cancels auto-sail
        if (autoTarget) {
          clearAutoSailTarget();
          lastAutoPortId = null;
          autoPath = [];
          autoPathIndex = 0;
          resetStuck();
        }
        player.setHeading(manualDir);
      } else if (autoTarget) {
        // Recompute A* path when destination changes
        if (autoTarget.portId !== lastAutoPortId) {
          lastAutoPortId = autoTarget.portId;
          resetStuck();
          autoPath = findPath(player.position(), autoTarget.position, getCache());
          autoPathIndex = 0;
        }

        const pos = player.position();

        // Close enough to dock?
        const dockDist =
          Math.abs(pos.x - autoTarget.position.x) +
          Math.abs(pos.y - autoTarget.position.y);

        if (dockDist < 6) {
          if (dockAndSyncNpcs(autoTarget.position)) {
            clearAutoSailTarget();
            lastAutoPortId = null;
            autoPath = [];
            return false;
          }
        }

        // Collision probe: 1×1 tile check for player movement
        const probeDir = (dir: Direction): boolean => {
          const { xDelta, yDelta } = directionToChanges[dir];
          const px = Math.floor(pos.x + xDelta);
          const py = Math.floor(pos.y + yDelta);
          return playerCollision({ x: px, y: py });
        };
        // Determine navigation target:
        // - During A* phase: follow waypoints in open water
        // - During approach phase (past last waypoint or close to destination):
        //   navigate directly toward port using tile-by-tile movement
        const destDx = Math.abs(pos.x - autoTarget.position.x) > MAP_W / 2
          ? MAP_W - Math.abs(pos.x - autoTarget.position.x)
          : Math.abs(pos.x - autoTarget.position.x);
        const destDist = destDx + Math.abs(pos.y - autoTarget.position.y);
        const inApproach = autoPathIndex >= autoPath.length || destDist < 30;

        let target: Position;

        if (inApproach) {
          // APPROACH PHASE: navigate directly to port
          target = autoTarget.position;
        } else {
          // A* WAYPOINT PHASE: follow waypoints
          const waypoint = autoPath[autoPathIndex];
          let wpDx = pos.x - waypoint.x;
          if (wpDx > MAP_W / 2) wpDx -= MAP_W;
          if (wpDx < -MAP_W / 2) wpDx += MAP_W;
          const wpDist = Math.abs(wpDx) + Math.abs(pos.y - waypoint.y);

          if (wpDist < WAYPOINT_RADIUS && autoPathIndex < autoPath.length - 1) {
            autoPathIndex++;
            resetStuck();
          }
          target = autoPath[autoPathIndex] ?? autoTarget.position;
        }

        // Desired compass direction toward target
        const desiredDir = posToCompass(pos, target);

        // Track progress toward target
        let tDx = pos.x - target.x;
        if (tDx > MAP_W / 2) tDx -= MAP_W;
        if (tDx < -MAP_W / 2) tDx += MAP_W;
        const tDist = Math.abs(tDx) + Math.abs(pos.y - target.y);

        if (tDist < bestDist - 0.3) {
          bestDist = tDist;
          stuckFrames = 0;
          rotateStep = 0;
        } else {
          stuckFrames++;

          if (stuckFrames >= STUCK_SKIP_THRESHOLD) {
            if (!inApproach && autoPathIndex < autoPath.length - 1) {
              // Skip to next waypoint
              autoPathIndex++;
              resetStuck();
            } else {
              // Recompute path from current position
              autoPath = findPath(pos, autoTarget.position, getCache());
              autoPathIndex = 0;
              resetStuck();
            }
          } else if (stuckFrames > 0 && stuckFrames % STUCK_ROTATE_INTERVAL === 0) {
            rotateStep++;
          }
        }

        // Apply rotation when stuck
        let heading = desiredDir;
        if (rotateStep > 0) {
          const sign = rotateStep % 2 === 1 ? 1 : -1;
          const steps = Math.ceil(rotateStep / 2);
          heading = rotateCompass(desiredDir, sign * steps);
        }

        // If heading is blocked, try nearby directions
        if (probeDir(heading)) {
          for (let r = 1; r <= 7; r++) {
            const cw = rotateCompass(desiredDir, r);
            if (!probeDir(cw)) { heading = cw; break; }
            const ccw = rotateCompass(desiredDir, -r);
            if (!probeDir(ccw)) { heading = ccw; break; }
          }
        }

        player.setHeading(heading);
      }

      player.updateSpeed();

      const heading = player.heading();

      if (heading) {
        player.move(heading, playerCollision);

        // Only run stuck detection when ship has speed (can actually move)
        if (player.speed() > 0) {
          const pos = player.position();
          if (stuckTimer === 0) {
            stuckCheckX = pos.x;
            stuckCheckY = pos.y;
          }
          stuckTimer++;

          if (stuckTimer >= STUCK_CHECK_INTERVAL) {
            let dx = Math.abs(pos.x - stuckCheckX);
            if (dx > MAP_W / 2) dx = MAP_W - dx;
            const dy = Math.abs(pos.y - stuckCheckY);
            const progress = dx + dy;

            if (progress < STUCK_MIN_PROGRESS) {
              player.forceMove(heading, playerCollision);
            }
            stuckTimer = 0;
          }
        } else {
          stuckTimer = 0;
        }
      } else {
        stuckTimer = 0;
      }

      // Check for NPC collision → trigger sea battle
      npcs.forEach((npc, i) => {
        if (state.battle) return;
        const npcPos = npc.position();
        const playerPos = player.position();
        const dx = playerPos.x - npcPos.x;
        const dy = playerPos.y - npcPos.y;
        if (Math.sqrt(dx * dx + dy * dy) < BATTLE_TRIGGER_RADIUS) {
          const enemyType = ENEMY_TYPES[i % ENEMY_TYPES.length];
          startBattle(enemyType);
        }
      });

      npcs.forEach((npc, i) => {
        npc.update();

        if (!npc.shouldMove()) {
          return;
        }

        // Pick a new random port when close enough to the current target
        if (npc.isNearTarget()) {
          const fromIdx = npcTargetPort[i];
          const { idx: toIdx, pos: targetPos } = pickRandomPort();
          const route = getRoute(fromIdx, toIdx);
          if (route) {
            npc.setRoute(route, targetPos);
          } else {
            npc.setTarget(targetPos);
          }
          npcTargetPort[i] = toIdx;
        }

        npc.move();
      });

      return !!heading;
    },
    player: () => player,
    npcs: () => npcs,
    autoSailRoute: () => ({ path: autoPath, index: autoPathIndex }),
  };
};

export type WorldCharacters = ReturnType<typeof createWorldCharacters>;

export default createWorldCharacters;
