// Battle state actions — wires seaBattle logic to game state + React UI

import state, { SAVED_STATE_KEY } from './state';
import updateInterface from './updateInterface';
import { updateGeneral } from './actionsPort';
import type { EnemyType } from '../data/battleData';
import type { PlayerAction, DuelMove } from '../game/world/seaBattle';
import {
  initBattle,
  resolveTurn,
  resolvePistolPhase,
  resolveSwordMove,
  checkDuelOver,
  type BattleCaptainStats,
} from '../game/world/seaBattle';
import sailorData from '../data/sailorData';
import type { SailorSkills } from '../data/sailorData';

// ─── Captain Resolution ──────────────────────────────────────────────────

function getPlayerCaptainStats(): BattleCaptainStats {
  const captainMate = state.mates[0];
  if (!captainMate) {
    return { leadership: 50, seamanship: 50, courage: 50, swordplay: 50, intuition: 50, luck: 50 };
  }
  const sailor = sailorData[captainMate.sailorId];
  if (!sailor) {
    return { leadership: 50, seamanship: 50, courage: 50, swordplay: 50, intuition: 50, luck: 50 };
  }
  return {
    leadership: sailor.stats.leadership,
    seamanship: sailor.stats.seamanship,
    courage: sailor.stats.courage,
    swordplay: sailor.stats.swordplay,
    intuition: sailor.stats.intuition,
    luck: sailor.stats.luck,
  };
}

function playerHasGunnerySkill(): boolean {
  return state.mates.some((mate) => {
    const sailor = sailorData[mate.sailorId];
    return sailor?.skills.includes('Gunnery' as SailorSkills) ?? false;
  });
}

function getPlayerCaptainName(): string {
  const captainMate = state.mates[0];
  if (!captainMate) return 'Captain';
  return sailorData[captainMate.sailorId]?.name ?? 'Captain';
}

// ─── Start Battle ─────────────────────────────────────────────────────────

export const startBattle = (enemyType: EnemyType): void => {
  const playerFleet = state.fleets['1'];
  if (!playerFleet || playerFleet.ships.length === 0) return;

  const battle = initBattle(
    playerFleet.ships,
    getPlayerCaptainName(),
    getPlayerCaptainStats(),
    playerHasGunnerySkill(),
    enemyType,
  );

  state.battle = battle;
  updateInterface.battle(battle);
};

// ─── Player Turn Action ───────────────────────────────────────────────────

export const battleAction = (action: PlayerAction): void => {
  if (!state.battle || state.battle.phase !== 'sea') return;

  const next = resolveTurn(state.battle, action);
  state.battle = next;
  updateInterface.battle(next);
};

// ─── Duel Actions ─────────────────────────────────────────────────────────

export const duelResolvePistol = (): void => {
  if (!state.battle?.duel) return;
  if (state.battle.duel.pistolResolved) return;

  const playerStats = getPlayerCaptainStats();
  const enemyStats = state.battle.enemy.captainStats;

  const nextDuel = resolvePistolPhase(
    state.battle.duel,
    playerStats,
    enemyStats,
  );

  const over = checkDuelOver(nextDuel);
  const next = {
    ...state.battle,
    duel: nextDuel,
    phase: over === 'player_wins'
      ? 'victory' as const
      : over === 'enemy_wins'
      ? 'defeat' as const
      : 'duel' as const,
  };

  state.battle = next;
  updateInterface.battle(next);
};

export const duelAction = (move: DuelMove): void => {
  if (!state.battle?.duel) return;
  if (state.battle.duel.phase !== 'sword') return;

  const playerStats = getPlayerCaptainStats();
  const enemyStats = state.battle.enemy.captainStats;

  const nextDuel = resolveSwordMove(
    state.battle.duel,
    move,
    playerStats,
    enemyStats,
  );

  const over = checkDuelOver(nextDuel);
  const next = {
    ...state.battle,
    duel: nextDuel,
    phase: over === 'player_wins'
      ? 'victory' as const
      : over === 'enemy_wins'
      ? 'defeat' as const
      : 'duel' as const,
  };

  state.battle = next;
  updateInterface.battle(next);
};

// ─── End Battle (apply results to state) ─────────────────────────────────

export const endBattle = (): void => {
  const battle = state.battle;
  if (!battle) return;

  const wasVictory = battle.phase === 'victory';

  if (wasVictory) {
    if (battle.lootGold > 0) {
      state.gold += battle.lootGold;
    }

    // Add piracy fame for any victory (not when player escaped — piracyFame is 0 in that case)
    if (battle.piracyFame > 0) {
      state.fame = {
        ...state.fame,
        piracy: (state.fame?.piracy ?? 0) + battle.piracyFame,
      };
    }

    // Notify player
    const famePart = battle.piracyFame > 0 ? ` Piracy fame +${battle.piracyFame}.` : '';
    const goldPart = battle.lootGold > 0 ? `Captured ${battle.lootGold.toLocaleString()} gold!` : 'The enemy has been driven off.';
    updateInterface.notification('Victory at Sea!', goldPart + famePart);
  }

  if (battle.phase === 'defeat') {
    // Apply significant hull damage on defeat
    const flagship = state.fleets['1'].ships[0];
    if (flagship) {
      flagship.durability = Math.max(5, Math.floor(flagship.durability * 0.5));
    }

    updateInterface.notification(
      'Defeat!',
      'Your fleet was overwhelmed. Your flagship took heavy damage.',
    );
  }

  // Sync hull damage back to player ships
  if (battle.player.maxHull > 0) {
    const hullRatio = battle.player.currentHull / battle.player.maxHull;
    state.fleets['1'].ships.forEach((ship) => {
      ship.durability = Math.max(1, Math.floor(ship.durability * hullRatio));
    });
    // Sync crew losses
    if (battle.player.maxCrew > 0) {
      const crewRatio = battle.player.currentCrew / battle.player.maxCrew;
      state.fleets['1'].ships.forEach((ship) => {
        ship.crew = Math.max(1, Math.floor(ship.crew * crewRatio));
      });
    }
  }

  state.battle = null;
  window.localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(state));
  updateInterface.battle(null);
  updateGeneral();
};
