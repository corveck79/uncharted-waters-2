// Captain duel UI overlay
// Renders when battle.phase === 'duel'

import React from 'react';
import type { BattleState, DuelState } from '../../game/world/seaBattle';
import { duelAction, duelResolvePistol, endBattle } from '../../state/actionsBattle';
import { duelMoves, DUEL_CONSTANTS } from '../../data/battleData';
import type { DuelMove, DuelMoveKind } from '../../data/battleData';

// ─── HP Bar ────────────────────────────────────────────────────────────────

function DuelHpBar({
  current,
  max,
  name,
  align,
}: {
  current: number;
  max: number;
  name: string;
  align: 'left' | 'right';
}) {
  const pct = Math.max(0, (current / max) * 100);
  const color = pct > 60 ? '#4caf50' : pct > 30 ? '#ff9800' : '#f44336';

  return (
    <div className="flex flex-col gap-1" style={{ width: 200, textAlign: align }}>
      <div className="text-sm font-bold text-white">{name}</div>
      <div className="flex justify-between text-xs text-gray-400 mb-0.5">
        <span>HP</span>
        <span>{current}/{max}</span>
      </div>
      <div className="h-3 bg-gray-800 rounded overflow-hidden">
        <div
          className="h-full rounded transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ─── Move Button ──────────────────────────────────────────────────────────

function MoveButton({
  move,
  onClick,
  kind,
}: {
  move: DuelMove;
  onClick: () => void;
  kind: DuelMoveKind;
}) {
  const data = duelMoves[move];
  const isOffense = kind === 'offense';
  const beatsData = duelMoves[data.beats];

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start p-3 rounded transition-all text-left"
      style={{
        background: isOffense
          ? 'linear-gradient(135deg, #3a1e0a 0%, #1f0d04 100%)'
          : 'linear-gradient(135deg, #0a1e3a 0%, #04111f 100%)',
        border: `1px solid ${isOffense ? 'rgba(244,120,54,0.45)' : 'rgba(54,144,244,0.45)'}`,
        color: '#fff',
        cursor: 'pointer',
        minWidth: 140,
      }}
    >
      <div className="font-bold text-sm">{data.name}</div>
      <div className="text-xs opacity-70 mt-0.5">{data.description}</div>
      <div className="text-xs mt-1 opacity-50">
        beats <span style={{ color: isOffense ? '#f47836' : '#3690f4' }}>{beatsData.name}</span>
      </div>
    </button>
  );
}

// ─── Duel Log ─────────────────────────────────────────────────────────────

function DuelLog({ lines }: { lines: string[] }) {
  return (
    <div
      className="rounded p-3 overflow-y-auto"
      style={{
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(201,168,76,0.2)',
        height: 130,
        fontSize: 11,
        color: '#ccc',
      }}
    >
      {[...lines].reverse().map((line, i) => (
        <div
          key={i}
          className="mb-0.5 leading-relaxed"
          style={{ opacity: i === 0 ? 1 : Math.max(0.2, 0.9 - i * 0.12) }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}

// ─── Pistol Phase ─────────────────────────────────────────────────────────

function PistolPhase({ duel }: { duel: DuelState }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-lg font-bold text-white">Pistol Phase</div>
      <div className="text-sm text-gray-400 text-center max-w-xs">
        Both captains take aim. Leadership and luck decide who hits.
      </div>

      <div className="text-4xl">🔫</div>

      <DuelLog lines={duel.log} />

      <button
        onClick={duelResolvePistol}
        className="px-8 py-3 rounded font-bold text-white transition-all"
        style={{
          background: 'linear-gradient(135deg, #c9a84c 0%, #8b6914 100%)',
          border: '1px solid rgba(201,168,76,0.8)',
        }}
      >
        Fire!
      </button>
    </div>
  );
}

// ─── Sword Phase ──────────────────────────────────────────────────────────

const OFFENSE_MOVES: DuelMove[] = ['thrust', 'lash', 'strike'];
const DEFENSE_MOVES: DuelMove[] = ['parry', 'block', 'dodge'];

function SwordPhase({ duel }: { duel: DuelState }) {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-lg font-bold text-white">Sword Phase</div>

      <DuelLog lines={duel.log} />

      {/* Two-column grid: Offense left, Defense right */}
      <div className="flex gap-6 justify-center">
        <div className="flex flex-col gap-2">
          <div
            className="text-xs uppercase tracking-widest text-center mb-1"
            style={{ color: '#f47836' }}
          >
            Offense
          </div>
          {OFFENSE_MOVES.map((move) => (
            <MoveButton
              key={move}
              move={move}
              kind="offense"
              onClick={() => duelAction(move)}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <div
            className="text-xs uppercase tracking-widest text-center mb-1"
            style={{ color: '#3690f4' }}
          >
            Defense
          </div>
          {DEFENSE_MOVES.map((move) => (
            <MoveButton
              key={move}
              move={move}
              kind="defense"
              onClick={() => duelAction(move)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Duel Outcome ─────────────────────────────────────────────────────────

function DuelOutcome({ victory }: { victory: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="text-3xl font-bold"
        style={{ color: victory ? '#c9a84c' : '#f44336' }}
      >
        {victory ? 'You Win the Duel!' : 'Defeated in Duel!'}
      </div>
      <div className="text-sm text-gray-400 text-center">
        {victory
          ? 'The enemy captain falls. Your crew celebrates!'
          : 'You are wounded but survive. Your crew is demoralized.'}
      </div>
      <button
        onClick={endBattle}
        className="px-8 py-3 rounded font-bold text-white transition-all"
        style={{
          background: 'linear-gradient(135deg, #1e2d4a 0%, #0d1a2e 100%)',
          border: '1px solid rgba(201,168,76,0.4)',
        }}
      >
        Continue
      </button>
    </div>
  );
}

// ─── Main CaptainDuel Component ────────────────────────────────────────────

export default function CaptainDuel({ battle }: { battle: BattleState }) {
  const { duel, player, enemy, phase } = battle;

  if (!duel) return null;

  const isOver = phase === 'victory' || phase === 'defeat';
  const isVictory = phase === 'victory';

  return (
    <div
      className="absolute inset-0 flex flex-col z-50"
      style={{
        background: 'linear-gradient(180deg, rgba(15,5,5,0.98) 0%, rgba(8,3,3,0.99) 100%)',
        backdropFilter: 'blur(6px)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-center px-6 py-3"
        style={{
          borderBottom: '1px solid rgba(201,168,76,0.3)',
          background: 'rgba(0,0,0,0.5)',
        }}
      >
        <div className="text-sm uppercase tracking-widest font-bold" style={{ color: '#c9a84c' }}>
          Captain's Duel
        </div>
      </div>

      {/* HP bars */}
      <div className="flex justify-between items-start px-8 py-4">
        <DuelHpBar
          current={duel.playerHP}
          max={DUEL_CONSTANTS.STARTING_HP}
          name={player.captainName}
          align="left"
        />
        <div className="text-2xl self-center" style={{ opacity: 0.5 }}>⚔</div>
        <DuelHpBar
          current={duel.enemyHP}
          max={DUEL_CONSTANTS.STARTING_HP}
          name={enemy.captainName}
          align="right"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-6">
        {isOver ? (
          <DuelOutcome victory={isVictory} />
        ) : duel.phase === 'pistol' ? (
          <PistolPhase duel={duel} />
        ) : (
          <SwordPhase duel={duel} />
        )}
      </div>
    </div>
  );
}
