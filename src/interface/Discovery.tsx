import React, { useState } from 'react';

import { getDiscoveries, getDiscoveryCount, getTotalDiscoveries } from '../state/selectors';
import { discoveryData, type Discovery, type DiscoveryCategory } from '../data/discoveryData';

const CATEGORY_COLORS: Record<DiscoveryCategory, string> = {
  landmark: '#c9a84c',
  creature: '#4a9c7a',
  plant: '#7a9c4a',
  phenomenon: '#9c4a9c',
};

const CATEGORY_LABELS: Record<DiscoveryCategory, string> = {
  landmark: 'Landmark',
  creature: 'Creature',
  plant: 'Plant',
  phenomenon: 'Phenomenon',
};

export default function Discovery({ onClose }: { onClose: () => void }) {
  const discoveredIds = getDiscoveries();
  const count = getDiscoveryCount();
  const total = getTotalDiscoveries();
  const [selected, setSelected] = useState<Discovery | null>(
    discoveredIds.length > 0 ? discoveryData[discoveredIds[0]] : null,
  );

  const discoveredItems = discoveredIds.map((id) => discoveryData[id]);

  return (
    <div
      className="rounded select-none"
      style={{
        background: 'linear-gradient(135deg, #1a1408 0%, #0d0d1a 100%)',
        border: '2px solid rgba(201,168,76,0.4)',
        width: 520,
        maxHeight: 560,
        boxShadow: '0 0 40px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}
      >
        <div>
          <div className="text-base font-bold" style={{ color: '#c9a84c' }}>Discovery Log</div>
          <div className="text-xs text-gray-500">{count} / {total} discovered</div>
        </div>
        <div
          className="h-2 rounded"
          style={{ width: 120, background: '#1a1a2e', border: '1px solid #333' }}
        >
          <div
            className="h-full rounded"
            style={{ width: `${(count / total) * 100}%`, background: '#4a7c9c' }}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* List */}
        <div
          className="overflow-y-auto"
          style={{ width: 190, borderRight: '1px solid rgba(201,168,76,0.15)' }}
        >
          {discoveredItems.length === 0 ? (
            <div className="p-4 text-xs text-gray-600 text-center">No discoveries yet</div>
          ) : (
            discoveredItems.map((item) => (
              <div
                key={item.id}
                className="px-3 py-2 cursor-pointer"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: selected?.id === item.id ? 'rgba(201,168,76,0.12)' : undefined,
                  borderLeft: selected?.id === item.id ? '2px solid #c9a84c' : '2px solid transparent',
                }}
                onClick={() => setSelected(item)}
              >
                <div className="text-xs text-gray-200 leading-tight">{item.name}</div>
                <div
                  className="text-[10px] mt-0.5"
                  style={{ color: CATEGORY_COLORS[item.category] }}
                >
                  {CATEGORY_LABELS[item.category]}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selected ? (
            <>
              <div className="text-sm font-bold text-white mb-1">{selected.name}</div>
              <div
                className="text-[10px] uppercase tracking-wider mb-3"
                style={{ color: CATEGORY_COLORS[selected.category] }}
              >
                {CATEGORY_LABELS[selected.category]} — {selected.region}
              </div>
              <div className="text-xs text-gray-400 leading-relaxed mb-3">
                {selected.description}
              </div>
              <div className="text-[10px] text-gray-600">
                Adventure fame: +{selected.adventureFame}
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-600 text-center mt-8">Select a discovery</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3"
        style={{ borderTop: '1px solid rgba(201,168,76,0.15)' }}
      >
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
