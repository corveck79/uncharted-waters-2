// Sea battle engine — pure logic, no state mutations
// Based on SNES ROM analysis + Uncharted Waters: New Horizons game mechanics

import {
  BATTLE_CONSTANTS,
  DUEL_CONSTANTS,
  DEFAULT_CANNON_TYPE,
  type BattleDistance,
  type EnemyType,
  cannonTypes,
  distanceInfo,
  formations,
  duelMoves,
  getDuelOutcome,
  type DuelMove,
  enemyFleetPresets,
  type EnemyFleetPreset,
} from '../../data/battleData';
import { shipData } from '../../data/shipData';
import type { Ship } from './fleets';

// ─── Battle State Types ────────────────────────────────────────────────────

export interface BattleCaptainStats {
  leadership: number;
  seamanship: number;
  courage: number;
  swordplay: number;
  intuition: number;
  luck: number;
}

export interface BattleFleetState {
  ships: Ship[];
  currentHull: number;
  maxHull: number;
  currentCrew: number;
  maxCrew: number;
  morale: number;
  formation: string;
  cannonType: string;
  captainName: string;
  captainStats: BattleCaptainStats;
  hasGunnerySkill: boolean;
}

export type DuelPhase = 'pistol' | 'sword';

export interface DuelState {
  phase: DuelPhase;
  playerHP: number;
  enemyHP: number;
  pistolResolved: boolean;
  log: string[];
}

export type BattlePhase = 'sea' | 'duel' | 'victory' | 'defeat';

export interface BattleState {
  phase: BattlePhase;
  distance: BattleDistance;
  player: BattleFleetState;
  enemy: BattleFleetState;
  turn: number;
  log: string[];
  duel: DuelState | null;
  lootGold: number;
  piracyFame: number;
  enemyType: EnemyType;
  canTriggerDuel: boolean;
}

// ─── Fleet Initialization ─────────────────────────────────────────────────

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const countFleetGuns = (ships: Ship[]): number =>
  ships.reduce((sum, ship) => {
    const base = shipData[ship.id]?.usedGuns ?? 0;
    return sum + (ship.configGuns ?? base);
  }, 0);

const countFleetMaxHull = (ships: Ship[]): number =>
  ships.reduce((sum, ship) => {
    const base = shipData[ship.id]?.durability ?? 50;
    return sum + base;
  }, 0);

const countFleetCrew = (ships: Ship[]): number =>
  ships.reduce((sum, ship) => sum + ship.crew, 0);

export function initPlayerFleet(
  ships: Ship[],
  captainName: string,
  captainStats: BattleCaptainStats,
  hasGunnerySkill: boolean,
): BattleFleetState {
  const maxHull = countFleetMaxHull(ships);
  const currentCrew = countFleetCrew(ships);
  // Current hull = sum of each ship's current durability vs its max
  const currentHull = ships.reduce((sum, ship) => sum + ship.durability, 0);
  return {
    ships,
    currentHull,
    maxHull,
    currentCrew,
    maxCrew: currentCrew,
    morale: BATTLE_CONSTANTS.MORALE_MAX,
    formation: 'line',
    cannonType: DEFAULT_CANNON_TYPE,
    captainName,
    captainStats,
    hasGunnerySkill,
  };
}

export function initEnemyFleet(preset: EnemyFleetPreset): BattleFleetState {
  // Build mock ships from preset's shipIds
  const ships: Ship[] = preset.shipIds.map((shipId, i) => ({
    uid: `enemy-${i}`,
    id: shipId,
    name: shipData[shipId]?.name ?? 'Enemy Ship',
    crew: shipData[shipId]?.usedCrew ?? 20,
    cargo: [],
    durability: shipData[shipId]?.durability ?? 50,
  }));

  const maxHull = countFleetMaxHull(ships);
  const currentCrew = countFleetCrew(ships);

  return {
    ships,
    currentHull: maxHull,
    maxHull,
    currentCrew,
    maxCrew: currentCrew,
    morale: BATTLE_CONSTANTS.MORALE_MAX,
    formation: preset.formation,
    cannonType: preset.cannonType,
    captainName: preset.captainName,
    captainStats: {
      ...preset.captainStats,
      seamanship: preset.captainStats.seamanship,
      luck: 50,
    },
    hasGunnerySkill: false,
  };
}

// ─── Battle Initialization ────────────────────────────────────────────────

export function initBattle(
  playerShips: Ship[],
  captainName: string,
  captainStats: BattleCaptainStats,
  hasGunnerySkill: boolean,
  enemyType: EnemyType,
): BattleState {
  const preset = enemyFleetPresets[enemyType];
  const [minLoot, maxLoot] = preset.lootGold;
  const lootGold = Math.floor(minLoot + Math.random() * (maxLoot - minLoot));

  return {
    phase: 'sea',
    distance: 'medium',
    player: initPlayerFleet(playerShips, captainName, captainStats, hasGunnerySkill),
    enemy: initEnemyFleet(preset),
    turn: 1,
    log: [`You have encountered ${preset.name}!`, `Captain ${preset.captainName} commands the enemy fleet.`],
    duel: null,
    lootGold,
    piracyFame: preset.piracyFame,
    enemyType,
    canTriggerDuel: preset.canTriggerDuel,
  };
}

// ─── Combat Calculations ──────────────────────────────────────────────────

export function calcHitChance(
  attacker: BattleFleetState,
  distance: BattleDistance,
): number {
  const cannon = cannonTypes[attacker.cannonType];
  const leadershipBonus =
    Math.max(0, attacker.captainStats.leadership - 50) * BATTLE_CONSTANTS.LEADERSHIP_HIT_BONUS;
  const gunneryBonus = attacker.hasGunnerySkill ? BATTLE_CONSTANTS.GUNNERY_HIT_BONUS : 0;
  const raw =
    BATTLE_CONSTANTS.BASE_HIT_CHANCE +
    leadershipBonus +
    gunneryBonus +
    cannon.hitChanceBonus;
  return clamp(raw, 10, 90) / 100;
}

export function calcCannonDamage(
  attacker: BattleFleetState,
  defender: BattleFleetState,
  distance: BattleDistance,
): { damage: number; log: string } {
  const cannon = cannonTypes[attacker.cannonType];
  const rangeMult = cannon.powerByRange[distance];

  // No damage possible at this range
  if (rangeMult === 0) {
    return {
      damage: 0,
      log: `${attacker.captainName}'s cannons cannot reach at this distance!`,
    };
  }

  const totalGuns = countFleetGuns(attacker.ships);
  const rawDamage = totalGuns * cannon.power * rangeMult;

  // Formation modifiers
  const atkFormation = formations[attacker.formation];
  const defFormation = formations[defender.formation];
  const formationMod = atkFormation.attackBonus * defFormation.defenseBonus;

  // Crew efficiency
  const crewRatio = attacker.currentCrew / Math.max(1, attacker.maxCrew);
  const crewFactor =
    crewRatio >= BATTLE_CONSTANTS.CREW_EFFICIENCY_THRESHOLD
      ? 1.0
      : crewRatio / BATTLE_CONSTANTS.CREW_EFFICIENCY_THRESHOLD;

  // Morale factor: 0.5 at 0 morale, 1.0 at 100 morale
  const moraleFactor =
    0.5 + (attacker.morale / BATTLE_CONSTANTS.MORALE_MAX) * BATTLE_CONSTANTS.MORALE_DAMAGE_FACTOR;

  // Hit rate with variance
  const hitRate = calcHitChance(attacker, distance);
  const variance = 0.8 + Math.random() * 0.4;

  const finalDamage = Math.round(
    rawDamage * formationMod * crewFactor * moraleFactor * hitRate * variance,
  );

  const hitPct = Math.round(hitRate * 100);
  const log = finalDamage > 0
    ? `${attacker.captainName} fires! (${hitPct}% accuracy) — ${finalDamage} hull damage to ${defender.captainName}!`
    : `${attacker.captainName}'s volley misses!`;

  return { damage: finalDamage, log };
}

export function applyDamage(
  fleet: BattleFleetState,
  damage: number,
): BattleFleetState {
  const newHull = Math.max(0, fleet.currentHull - damage);
  const hullDamageRatio = damage / Math.max(1, fleet.maxHull);
  const moraleLoss = hullDamageRatio * BATTLE_CONSTANTS.MORALE_LOSS_PER_DAMAGE * 10;
  const newMorale = Math.max(
    BATTLE_CONSTANTS.MORALE_SURRENDER,
    fleet.morale - moraleLoss,
  );

  return { ...fleet, currentHull: newHull, morale: newMorale };
}

export function calcBoardingDamage(
  attacker: BattleFleetState,
  defender: BattleFleetState,
): { crewLost: number; hullDamage: number; log: string } {
  const advantage = attacker.currentCrew - defender.currentCrew;
  if (advantage <= 0) {
    return {
      crewLost: 0,
      hullDamage: 0,
      log: `${attacker.captainName} boards but the enemy crew holds firm!`,
    };
  }

  // Courage and leadership affect boarding
  const leadershipFactor =
    attacker.captainStats.leadership / Math.max(1, defender.captainStats.leadership);
  const courageFactor =
    attacker.captainStats.courage / Math.max(1, defender.captainStats.courage);

  const rawDamage =
    (advantage / Math.max(1, defender.maxCrew)) *
    BATTLE_CONSTANTS.BOARDING_CREW_DAMAGE *
    leadershipFactor *
    courageFactor *
    (0.7 + Math.random() * 0.6);

  const crewLost = Math.round(
    defender.maxCrew * rawDamage * 0.01,
  );
  const hullDamage = Math.round(rawDamage * 0.5);

  return {
    crewLost,
    hullDamage,
    log: `${attacker.captainName} boards the enemy! ${crewLost} crew cut down!`,
  };
}

// ─── Distance Management ──────────────────────────────────────────────────

const DISTANCES: BattleDistance[] = ['far', 'medium', 'close', 'boarding'];

export function getDistanceIndex(distance: BattleDistance): number {
  return DISTANCES.indexOf(distance);
}

export function advanceDistance(current: BattleDistance): BattleDistance {
  const idx = getDistanceIndex(current);
  return DISTANCES[Math.min(idx + 1, DISTANCES.length - 1)];
}

export function retreatDistance(current: BattleDistance): BattleDistance {
  const idx = getDistanceIndex(current);
  return DISTANCES[Math.max(idx - 1, 0)];
}

export function calcEscapeChance(
  player: BattleFleetState,
  enemy: BattleFleetState,
  distance: BattleDistance,
): number {
  if (!distanceInfo[distance].canEscape) return 0;

  // Speed from seamanship stat as proxy
  const playerSpeed = player.captainStats.seamanship;
  const enemySpeed = enemy.captainStats.seamanship;
  const speedAdvantage = (playerSpeed - enemySpeed) / 100;

  const base = 50 + speedAdvantage * 40;
  const mod = distanceInfo[distance].escapeChanceMod;
  return clamp(base * mod, 5, 95);
}

// ─── Enemy AI ─────────────────────────────────────────────────────────────

type EnemyAction = 'cannon' | 'charge' | 'escape';

export function enemyAI(
  battle: BattleState,
): EnemyAction {
  const { enemyType, distance, enemy } = battle;
  const hullPct = enemy.currentHull / Math.max(1, enemy.maxHull);

  // Flee if badly damaged
  if (hullPct < 0.2 && distanceInfo[distance].canEscape) {
    return 'escape';
  }

  // Type-based strategy
  const roll = Math.random();
  switch (enemyType) {
    case 'pirate':
      // Aggressive — close and board
      if (distance === 'far' || distance === 'medium') return roll < 0.6 ? 'charge' : 'cannon';
      return roll < 0.7 ? 'charge' : 'cannon';
    case 'corsair':
      return roll < 0.5 ? 'charge' : 'cannon';
    case 'warship':
      // Prefers medium-range cannon fire
      if (distance === 'far') return 'charge';
      if (distance === 'boarding') return 'cannon'; // can't charge further
      return roll < 0.8 ? 'cannon' : 'charge';
    case 'merchant':
      // Tries to flee, fires defensively
      if (distanceInfo[distance].canEscape && roll < 0.7) return 'escape';
      return 'cannon';
    case 'rival':
      return roll < 0.55 ? 'cannon' : 'charge';
    default:
      return 'cannon';
  }
}

// ─── Turn Resolution ──────────────────────────────────────────────────────

export type PlayerAction = 'cannon' | 'charge' | 'escape' | 'boarding';

export function resolveTurn(
  battle: BattleState,
  playerAction: PlayerAction,
): BattleState {
  const nextLog: string[] = [];
  let { distance, player, enemy } = battle;

  const enemyAction = enemyAI(battle);

  // ── Player action ──
  if (playerAction === 'cannon') {
    const { damage, log } = calcCannonDamage(player, enemy, distance);
    enemy = applyDamage(enemy, damage);
    nextLog.push(log);
  } else if (playerAction === 'charge') {
    const newDist = advanceDistance(distance);
    if (newDist !== distance) {
      distance = newDist;
      nextLog.push(`You close the distance! Now at ${distanceInfo[distance].label}.`);
    }
  } else if (playerAction === 'boarding') {
    if (distance === 'boarding') {
      const result = calcBoardingDamage(player, enemy);
      enemy = {
        ...enemy,
        currentCrew: Math.max(0, enemy.currentCrew - result.crewLost),
        currentHull: Math.max(0, enemy.currentHull - result.hullDamage),
        morale: Math.max(0, enemy.morale - 20),
      };
      nextLog.push(result.log);
    }
  } else if (playerAction === 'escape') {
    const chance = calcEscapeChance(player, enemy, distance);
    if (Math.random() * 100 < chance) {
      nextLog.push('You successfully escape the battle!');
      return {
        ...battle,
        phase: 'victory', // escaping counts as a win (no loot)
        lootGold: 0,
        piracyFame: 0,
        player,
        enemy,
        log: [...battle.log.slice(-8), ...nextLog],
        turn: battle.turn + 1,
      };
    } else {
      nextLog.push('Escape failed! The enemy fleet cuts off your retreat!');
      distance = advanceDistance(distance);
    }
  }

  // ── Enemy action ──
  if (enemyAction === 'cannon') {
    const { damage, log } = calcCannonDamage(enemy, player, distance);
    player = applyDamage(player, damage);
    nextLog.push(log);
  } else if (enemyAction === 'charge') {
    const newDist = advanceDistance(distance);
    if (newDist !== distance) {
      distance = newDist;
      nextLog.push(`The enemy closes in! Now at ${distanceInfo[distance].label}.`);
    }
  } else if (enemyAction === 'escape') {
    const chance = calcEscapeChance(enemy, player, distance);
    if (Math.random() * 100 < chance) {
      nextLog.push('The enemy fleet flees! Battle over.');
      return {
        ...battle,
        phase: 'victory',
        player,
        enemy,
        log: [...battle.log.slice(-8), ...nextLog],
        turn: battle.turn + 1,
      };
    } else {
      nextLog.push("The enemy's escape attempt fails!");
    }
  }

  // ── Check victory conditions ──
  const newPhase = checkVictory({ ...battle, player, enemy });

  // After sea-battle victory: maybe start duel
  let nextPhase: BattlePhase = newPhase ?? 'sea';
  let duel: DuelState | null = battle.duel;

  if (newPhase === 'victory' && battle.canTriggerDuel && Math.random() < 0.65) {
    nextPhase = 'duel';
    duel = initDuel();
    nextLog.push(`${enemy.captainName} demands a personal duel!`);
  }

  return {
    ...battle,
    phase: nextPhase,
    distance,
    player,
    enemy,
    turn: battle.turn + 1,
    log: [...battle.log.slice(-8), ...nextLog],
    duel,
  };
}

export function checkVictory(battle: Pick<BattleState, 'player' | 'enemy'>): BattlePhase | null {
  if (battle.player.currentHull <= 0 || battle.player.morale <= BATTLE_CONSTANTS.MORALE_SURRENDER) {
    return 'defeat';
  }
  if (battle.enemy.currentHull <= 0 || battle.enemy.morale <= BATTLE_CONSTANTS.MORALE_SURRENDER) {
    return 'victory';
  }
  return null;
}

// ─── Captain Duel ─────────────────────────────────────────────────────────

export function initDuel(): DuelState {
  return {
    phase: 'pistol',
    playerHP: DUEL_CONSTANTS.STARTING_HP,
    enemyHP: DUEL_CONSTANTS.STARTING_HP,
    pistolResolved: false,
    log: ['The captains step forward. Draw your pistols!'],
  };
}

export function resolvePistolPhase(
  duel: DuelState,
  playerStats: BattleCaptainStats,
  enemyStats: BattleCaptainStats,
): DuelState {
  const log = [...duel.log];

  // Player pistol: leadership controls accuracy, intuition controls dodge
  const playerHitChance =
    DUEL_CONSTANTS.PISTOL_HIT_CHANCE +
    (playerStats.leadership - 50) * DUEL_CONSTANTS.PISTOL_LEADERSHIP_WEIGHT * 0.01 +
    playerStats.luck * DUEL_CONSTANTS.LUCK_RNG_FACTOR * 0.01;

  const enemyHitChance =
    DUEL_CONSTANTS.PISTOL_HIT_CHANCE +
    (enemyStats.leadership - 50) * DUEL_CONSTANTS.PISTOL_LEADERSHIP_WEIGHT * 0.01 +
    enemyStats.luck * DUEL_CONSTANTS.LUCK_RNG_FACTOR * 0.01;

  let { playerHP, enemyHP } = duel;

  const playerHits = Math.random() < clamp(playerHitChance, 0.1, 0.9);
  const enemyHits = Math.random() < clamp(enemyHitChance, 0.1, 0.9);

  // Dodge based on intuition
  const playerDodge =
    playerStats.intuition * DUEL_CONSTANTS.PISTOL_INTUITION_WEIGHT * 0.01;
  const enemyDodge =
    enemyStats.intuition * DUEL_CONSTANTS.PISTOL_INTUITION_WEIGHT * 0.01;

  if (playerHits && Math.random() > enemyDodge) {
    enemyHP = Math.max(0, enemyHP - DUEL_CONSTANTS.PISTOL_DAMAGE);
    log.push(`Your shot hits! The enemy captain takes ${DUEL_CONSTANTS.PISTOL_DAMAGE} damage!`);
  } else {
    log.push('Your pistol shot misses!');
  }

  if (enemyHits && Math.random() > playerDodge) {
    playerHP = Math.max(0, playerHP - DUEL_CONSTANTS.PISTOL_DAMAGE);
    log.push(`The enemy fires back! You take ${DUEL_CONSTANTS.PISTOL_DAMAGE} damage!`);
  } else {
    log.push("The enemy's shot misses you!");
  }

  log.push('Swords drawn! The duel continues...');

  return {
    ...duel,
    playerHP,
    enemyHP,
    phase: 'sword',
    pistolResolved: true,
    log,
  };
}

export function enemyDuelAI(
  duel: DuelState,
  enemyStats: BattleCaptainStats,
): DuelMove {
  const hpRatio = duel.enemyHP / DUEL_CONSTANTS.STARTING_HP;
  const playerHpRatio = duel.playerHP / DUEL_CONSTANTS.STARTING_HP;

  const offensiveMoves: DuelMove[] = ['thrust', 'lash', 'strike'];
  const defensiveMoves: DuelMove[] = ['parry', 'block', 'dodge'];

  // High courage: stay aggressive even when wounded
  const courageFactor = enemyStats.courage / 100;
  // Shift toward defense as HP drops; courage reduces this shift
  const defenseBias = Math.max(0, (0.5 - hpRatio) * (1 - courageFactor * 0.5));
  const offenseChance = clamp(0.6 + courageFactor * 0.2 - defenseBias, 0.2, 0.9);

  // High intuition: try to read the player's likely move based on their HP
  if (enemyStats.intuition > 65 && Math.random() < 0.4) {
    // Player is hurt → likely to gamble on offense → counter with defense
    if (playerHpRatio < 0.4) {
      const pick = defensiveMoves[Math.floor(Math.random() * defensiveMoves.length)];
      return pick;
    }
    // Player is healthy → likely to hedge with defense → press with offense
    if (playerHpRatio > 0.7) {
      const pick = offensiveMoves[Math.floor(Math.random() * offensiveMoves.length)];
      return pick;
    }
  }

  const pool = Math.random() < offenseChance ? offensiveMoves : defensiveMoves;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function resolveSwordMove(
  duel: DuelState,
  playerMove: DuelMove,
  playerStats: BattleCaptainStats,
  enemyStats: BattleCaptainStats,
): DuelState {
  const log = [...duel.log];
  const enemyMove = enemyDuelAI(duel, enemyStats);

  const pm = duelMoves[playerMove];
  const em = duelMoves[enemyMove];
  const outcome = getDuelOutcome(playerMove, enemyMove);

  let { playerHP, enemyHP } = duel;

  // Variance: final damage × [1 - V, 1 + V]
  const roll = () =>
    1 - DUEL_CONSTANTS.DAMAGE_VARIANCE + Math.random() * DUEL_CONSTANTS.DAMAGE_VARIANCE * 2;

  // Stat multiplier: stats are 0-100, baseline 50. Scales linearly (50 → ×1.0, 100 → ×2.0, 0 → ×0.0)
  const playerStatMult =
    pm.attackStatWeight * (playerStats.swordplay / 50) +
    pm.courageWeight * (playerStats.courage / 50);
  const enemyStatMult =
    em.attackStatWeight * (enemyStats.swordplay / 50) +
    em.courageWeight * (enemyStats.courage / 50);

  log.push(`You: ${pm.name} | Enemy: ${em.name}`);

  if (outcome === 'win') {
    // Player's move counters the enemy's — full damage, enemy takes nothing
    const damage = Math.max(1, Math.round(
      DUEL_CONSTANTS.WIN_BASE_DAMAGE * playerStatMult * roll(),
    ));
    enemyHP = Math.max(0, enemyHP - damage);
    log.push(`${pm.name} counters ${em.name}! ${damage} damage to the enemy captain.`);
  } else if (outcome === 'lose') {
    // Enemy's move counters the player — enemy deals full damage
    const damage = Math.max(1, Math.round(
      DUEL_CONSTANTS.WIN_BASE_DAMAGE * enemyStatMult * roll(),
    ));
    playerHP = Math.max(0, playerHP - damage);
    log.push(`${em.name} counters your ${pm.name}! You take ${damage} damage.`);
  } else {
    // Neutral — both land glancing blows
    const playerDmg = Math.max(1, Math.round(
      DUEL_CONSTANTS.NEUTRAL_DAMAGE * playerStatMult * roll(),
    ));
    const enemyDmg = Math.max(1, Math.round(
      DUEL_CONSTANTS.NEUTRAL_DAMAGE * enemyStatMult * roll(),
    ));
    enemyHP = Math.max(0, enemyHP - playerDmg);
    playerHP = Math.max(0, playerHP - enemyDmg);
    log.push(`Blades clash! You deal ${playerDmg}, take ${enemyDmg}.`);
  }

  return {
    ...duel,
    playerHP,
    enemyHP,
    log: log.slice(-10),
  };
}

export function checkDuelOver(duel: DuelState): 'player_wins' | 'enemy_wins' | null {
  if (duel.playerHP <= 0) return 'enemy_wins';
  if (duel.enemyHP <= 0) return 'player_wins';
  return null;
}
