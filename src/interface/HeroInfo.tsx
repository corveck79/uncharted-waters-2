import React from 'react';

import { getGoldCoins, getGoldIngots, getFame, getFriendship } from '../state/selectors';
import Assets from '../assets';
import { getPlayerSailorId } from '../state/selectors';

const FAME_MAX = 100000;

function Bar({ value, max = FAME_MAX, color = '#c9a84c' }: { value: number; max?: number; color?: string }) {
  return (
    <div className="flex-1 h-2 rounded" style={{ background: '#1a1a2e', border: '1px solid #333' }}>
      <div
        className="h-full rounded"
        style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }}
      />
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs text-gray-400 w-20 text-right">{label}</span>
      <Bar value={value} color={color} />
      <span className="text-xs text-gray-300 w-14 text-right">{value.toLocaleString()}</span>
    </div>
  );
}

export default function HeroInfo({ onClose }: { onClose: () => void }) {
  const sailorId = getPlayerSailorId();
  const portrait = Assets.characters(sailorId);
  const goldCoins = getGoldCoins();
  const goldIngots = getGoldIngots();
  const fame = getFame();
  const friendship = getFriendship();

  return (
    <div
      className="rounded p-5 select-none"
      style={{
        background: 'linear-gradient(135deg, #1a1408 0%, #0d0d1a 100%)',
        border: '2px solid rgba(201,168,76,0.4)',
        width: 380,
        boxShadow: '0 0 40px rgba(0,0,0,0.8)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={portrait}
          alt="Hero"
          style={{ width: 64, height: 80, imageRendering: 'pixelated' }}
        />
        <div>
          <div className="text-lg font-bold" style={{ color: '#c9a84c' }}>Hero Info</div>
        </div>
      </div>

      {/* Gold */}
      <div
        className="mb-3 pb-3"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}
      >
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Gold</div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Gold Ingots</span>
          <span className="text-amber-400 font-bold">{goldIngots}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Gold Coins</span>
          <span className="text-amber-300 font-bold">{goldCoins.toLocaleString()}</span>
        </div>
      </div>

      {/* Fame */}
      <div
        className="mb-3 pb-3"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}
      >
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Fame</div>
        <Row label="Trade" value={fame.trade} color="#4a9c7a" />
        <Row label="Piracy" value={fame.piracy} color="#9c4a4a" />
        <Row label="Adventure" value={fame.adventure} color="#4a7c9c" />
      </div>

      {/* Friendship */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Friendship</div>
        <Row label="Portugal" value={friendship.portugal} color="#4a7c9c" />
        <Row label="Spain" value={friendship.spain} color="#9c4a4a" />
        <Row label="Turkey" value={friendship.turkey} color="#9c7a4a" />
        <Row label="England" value={friendship.england} color="#4a4a9c" />
        <Row label="Italy" value={friendship.italy} color="#7c9c4a" />
        <Row label="Holland" value={friendship.holland} color="#9c8a4a" />
      </div>

      <button
        type="button"
        className="w-full py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}
