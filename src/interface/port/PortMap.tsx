import React from 'react';

import { getPortData } from '../../game/port/portUtils';
import { buildings } from '../../data/buildingData';
import { enterBuilding } from '../../state/actionsPort';
import state from '../../state/state';

const BUILDING_COLORS: { [key: string]: string } = {
  '1': '#c9a84c', // Market
  '2': '#8c6a2c', // Pub
  '3': '#4a7c9c', // Shipyard
  '4': '#4a9c7a', // Harbor
  '5': '#7c5a3a', // Lodge
  '6': '#9c7c4a', // Palace
  '7': '#5a7a5a', // Guild
  '9': '#4a6a9c', // Bank
  '10': '#7a4a9c', // Item Shop
  '11': '#9c9c4a', // Church
  '12': '#9c4a7a', // Fortune Teller
};

export default function PortMap({ onClose }: { onClose: () => void }) {
  const portId = state.portId;
  if (!portId) return null;

  const port = getPortData(portId);
  const portBuildings = port.buildings;

  // Build list of buildings present in this port
  const buildingList = Object.entries(portBuildings).map(([id, pos]) => ({
    id,
    name: buildings[id]?.name ?? `Building ${id}`,
    x: pos.x,
    y: pos.y,
  }));

  const handleEnter = (buildingId: string) => {
    onClose();
    enterBuilding(buildingId);
  };

  return (
    <div
      className="rounded select-none"
      style={{
        background: 'linear-gradient(135deg, #1a1408 0%, #0d0d1a 100%)',
        border: '2px solid rgba(201,168,76,0.4)',
        width: 360,
        boxShadow: '0 0 40px rgba(0,0,0,0.8)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}
      >
        <div className="font-bold" style={{ color: '#c9a84c' }}>{port.name} — Port Map</div>
      </div>

      {/* Map area: simple schematic */}
      <div className="relative" style={{ width: 360, height: 260 }}>
        {/* Parchment bg */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, #1e180a 0%, #0d0d1a 100%)' }}
        />

        {/* Port boundary */}
        <div
          className="absolute"
          style={{
            left: 20, top: 20, right: 20, bottom: 20,
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 4,
          }}
        />

        {/* Building dots */}
        {buildingList.map(({ id, name, x, y }) => {
          // Scale port coords (roughly 0-120) to display area (20-340, 20-240)
          const dx = 20 + (x / 120) * 300;
          const dy = 20 + (y / 80) * 200;
          const color = BUILDING_COLORS[id] ?? '#888';

          return (
            <div
              key={id}
              className="absolute cursor-pointer group"
              style={{ left: dx, top: dy, transform: 'translate(-50%, -50%)' }}
              onClick={() => handleEnter(id)}
            >
              <div
                className="w-3 h-3 rounded-full mb-0.5 group-hover:scale-125 transition-transform"
                style={{ background: color, boxShadow: `0 0 6px ${color}` }}
              />
              <div
                className="absolute left-4 top-0 text-xs whitespace-nowrap hidden group-hover:block px-1 rounded"
                style={{ background: 'rgba(0,0,0,0.8)', color, border: `1px solid ${color}40` }}
              >
                {name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Building list */}
      <div
        className="px-4 pb-3"
        style={{ borderTop: '1px solid rgba(201,168,76,0.15)' }}
      >
        <div className="text-xs text-gray-500 uppercase tracking-wider pt-3 mb-2">Buildings</div>
        <div className="grid grid-cols-2 gap-1">
          {buildingList.map(({ id, name }) => {
            const color = BUILDING_COLORS[id] ?? '#888';
            return (
              <button
                key={id}
                type="button"
                className="flex items-center gap-2 px-2 py-1 rounded text-left hover:bg-white/5 transition-colors"
                onClick={() => handleEnter(id)}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <span className="text-xs text-gray-300">{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pb-3">
        <button
          type="button"
          className="w-full py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
