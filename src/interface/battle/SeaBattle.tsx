// Sea battle UI overlay
// Renders during state.battle !== null (phase: 'sea')

import React from 'react';
import type { BattleState, BattleFleetState } from '../../game/world/seaBattle';
import { battleAction, endBattle } from '../../state/actionsBattle';
import { distanceInfo, formations } from '../../data/battleData';
import type { PlayerAction } from '../../game/world/seaBattle';

// ─── Sub-components ────────────────────────────────────────────────────────

function FleetBar({
  fleet,
  label,
  align,
}: {
  fleet: BattleFleetState;
  label: string;
  align: 'left' | 'right';
}) {
  const hullPct = Math.max(0, (fleet.currentHull / Math.max(1, fleet.maxHull)) * 100);
  const moralePct = fleet.morale;

  const hullColor =
    hullPct > 60 ? '#4caf50' : hullPct > 30 ? '#ff9800' : '#f44336';
  const moraleColor =
    moralePct > 60 ? '#42a5f5' : moralePct > 30 ? '#ff9800' : '#f44336';

  return (
    <div
      className="flex flex-col gap-1"
      style={{ width: 220, textAlign: align }}
    >
      <div className="text-xs text-[#c9a84c] uppercase tracking-wider">{label}</div>
      <div className="text-sm font-bold text-white">{fleet.captainName}</div>
      <div className="text-xs text-gray-400">{fleet.ships.length} ship(s) • {fleet.currentCrew} crew</div>

      {/* Hull bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-0.5">
          <span>Hull</span>
          <span>{Math.round(fleet.currentHull)}/{fleet.maxHull}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded overflow-hidden">
          <div
            className="h-full rounded transition-all duration-300"
            style={{ width: `${hullPct}%`, background: hullColor }}
          />
        </div>
      </div>

      {/* Morale bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-0.5">
          <span>Morale</span>
          <span>{Math.round(fleet.morale)}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded overflow-hidden">
          <div
            className="h-full rounded transition-all duration-300"
            style={{ width: `${moralePct}%`, background: moraleColor }}
          />
        </div>
      </div>

      {/* Formation badge */}
      <div className="text-xs text-gray-500">
        Formation: <span className="text-gray-300">{formations[fleet.formation]?.name ?? fleet.formation}</span>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  sub,
  onClick,
  disabled,
  highlight,
}: {
  label: string;
  sub?: string;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 rounded text-sm font-bold transition-all"
      style={{
        background: disabled
          ? 'rgba(80,80,80,0.3)'
          : highlight
          ? 'linear-gradient(135deg, #c9a84c 0%, #8b6914 100%)'
          : 'linear-gradient(135deg, #1e2d4a 0%, #0d1a2e 100%)',
        border: `1px solid ${disabled ? 'rgba(100,100,100,0.3)' : highlight ? 'rgba(201,168,76,0.8)' : 'rgba(201,168,76,0.3)'}`,
        color: disabled ? '#666' : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        minWidth: 120,
      }}
    >
      <div>{label}</div>
      {sub && <div className="text-xs font-normal opacity-70">{sub}</div>}
    </button>
  );
}

// ─── Battle Log ────────────────────────────────────────────────────────────

function BattleLog({ lines }: { lines: string[] }) {
  return (
    <div
      className="rounded p-3 overflow-y-auto"
      style={{
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(201,168,76,0.2)',
        height: 120,
        fontSize: 11,
        color: '#ccc',
      }}
    >
      {[...lines].reverse().map((line, i) => (
        <div key={i} className="mb-0.5 leading-relaxed" style={{ opacity: i === 0 ? 1 : 0.7 - i * 0.08 }}>
          {line}
        </div>
      ))}
    </div>
  );
}

// ─── Outcome Screen ────────────────────────────────────────────────────────

function BattleOutcome({ battle }: { battle: BattleState }) {
  const victory = battle.phase === 'victory';

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div
        className="text-4xl font-bold"
        style={{ color: victory ? '#c9a84c' : '#f44336' }}
      >
        {victory ? 'VICTORY!' : 'DEFEAT!'}
      </div>

      {victory && battle.lootGold > 0 && (
        <div className="text-center">
          <div className="text-lg text-white mb-1">Plunder</div>
          <div className="text-2xl font-bold" style={{ color: '#c9a84c' }}>
            {battle.lootGold.toLocaleString()} Gold
          </div>
          {battle.piracyFame > 0 && (
            <div className="text-sm text-gray-400 mt-1">
              Piracy fame +{battle.piracyFame}
            </div>
          )}
        </div>
      )}

      {!victory && (
        <div className="text-center text-gray-400 text-sm">
          Your fleet was overwhelmed.<br />
          Your flagship took heavy damage.
        </div>
      )}

      <ActionButton
        label="Continue"
        onClick={endBattle}
        highlight
      />
    </div>
  );
}

// ─── Main Sea Battle Component ─────────────────────────────────────────────

export default function SeaBattle({ battle }: { battle: BattleState }) {
  const { distance, player, enemy, log, phase, turn } = battle;
  const distInfo = distanceInfo[distance];

  const isOutcome = phase === 'victory' || phase === 'defeat';
  const canBoard = distance === 'boarding';

  const handleAction = (action: PlayerAction) => {
    battleAction(action);
  };

  return (
    <div
      className="absolute inset-0 flex flex-col z-40"
      style={{
        background: 'linear-gradient(180deg, rgba(8,18,36,0.97) 0%, rgba(5,12,26,0.99) 100%)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{
          borderBottom: '1px solid rgba(201,168,76,0.3)',
          background: 'rgba(0,0,0,0.4)',
        }}
      >
        <div className="text-xs text-[#c9a84c] uppercase tracking-widest">Sea Battle</div>
        <div className="text-sm text-white">
          Turn <span className="font-bold text-[#c9a84c]">{turn}</span>
        </div>
        <div
          className="text-xs uppercase tracking-wider px-3 py-1 rounded"
          style={{
            background: 'rgba(201,168,76,0.15)',
            border: '1px solid rgba(201,168,76,0.3)',
            color: '#c9a84c',
          }}
        >
          {distInfo.label}
        </div>
      </div>

      {isOutcome ? (
        <BattleOutcome battle={battle} />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Player fleet */}
          <div className="flex flex-col justify-between p-5" style={{ width: 260 }}>
            <FleetBar fleet={player} label="Your Fleet" align="left" />
          </div>

          {/* Center: Action area */}
          <div className="flex flex-1 flex-col justify-between p-4 gap-3">
            {/* Distance description */}
            <div
              className="text-center text-xs text-gray-400 py-2 px-4 rounded"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {distInfo.description}
            </div>

            {/* Cannon fire visual indicator */}
            <div
              className="flex-1 flex items-center justify-center"
              style={{ position: 'relative' }}
            >
              <div
                className="text-6xl select-none"
                style={{ opacity: 0.15 }}
              >
                ⚓
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              <ActionButton
                label="Fire Cannons"
                sub={`${player.cannonType} • ${distInfo.label}`}
                onClick={() => handleAction('cannon')}
              />
              <ActionButton
                label={canBoard ? 'Board!' : 'Charge'}
                sub={canBoard ? 'Hand-to-hand combat' : 'Close the distance'}
                onClick={() => handleAction(canBoard ? 'boarding' : 'charge')}
                highlight={canBoard}
              />
              <ActionButton
                label="Escape"
                sub={distInfo.canEscape ? 'Attempt to flee' : 'Too close!'}
                onClick={() => handleAction('escape')}
                disabled={!distInfo.canEscape}
              />
            </div>

            {/* Battle log */}
            <BattleLog lines={log} />
          </div>

          {/* Right: Enemy fleet */}
          <div className="flex flex-col justify-between p-5" style={{ width: 260 }}>
            <FleetBar fleet={enemy} label="Enemy Fleet" align="right" />
          </div>
        </div>
      )}
    </div>
  );
}
