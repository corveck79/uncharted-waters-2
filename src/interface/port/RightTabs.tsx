/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { Fragment, useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';

import { classNames } from '../interfaceUtils';
import Fleet from '../Fleet';
import Mates from '../Mates';
import Items from '../Items';
import SaveLoad from '../SaveLoad';
import HeroInfo from '../HeroInfo';
import PortMap from './PortMap';
import Chart from '../Chart';
import PortInfo from './PortInfo';
import Discovery from '../Discovery';
import { setSail, dock, setAutoSailTarget } from '../../state/actionsWorld';
import { enterBuilding, setFirstMate } from '../../state/actionsPort';
import { getMates, getPlayerSailorId, getRoleDisplay, positionAdjacentToPort } from '../../state/selectors';
import { getPlayerFleet, getDaysProvisionsWillLast } from '../../state/selectorsFleet';
import { regularPorts } from '../../data/portData';
import state from '../../state/state';
import { shipData, hullData } from '../../data/shipData';
import { goodsData } from '../../data/goodsData';
import type { HullType } from '../../game/world/fleets';

type TabId = 'fleet' | 'crew' | 'info' | 'navigation';
type ContentId = string | null;

interface TabOption {
  id: string;
  label: string;
  atSea?: boolean; // available at sea
  inPort?: boolean; // available in port
}

const TAB_OPTIONS: Record<TabId, TabOption[]> = {
  fleet: [
    { id: 'fleet-info', label: 'Fleet Info', atSea: true, inPort: true },
    { id: 'ship-info', label: 'Ship Info', atSea: true, inPort: true },
    { id: 'cargo-info', label: 'Cargo Info', atSea: true, inPort: true },
  ],
  crew: [
    { id: 'wages', label: 'Wages', atSea: true, inPort: true },
    { id: 'job-duty', label: 'Change Job Duty', inPort: true },
    { id: 'rations', label: 'Rations', atSea: true, inPort: true },
  ],
  info: [
    { id: 'mate-info', label: 'Mate Info', atSea: true, inPort: true },
    { id: 'hero-info', label: 'Hero Info', atSea: true, inPort: true },
    { id: 'items', label: 'Item', atSea: true, inPort: true },
    { id: 'chart', label: 'Chart', atSea: true, inPort: true },
    { id: 'discovery', label: 'Discovery', atSea: true, inPort: true },
    { id: 'port-map', label: 'Port Map', inPort: true },
    { id: 'port-info', label: 'Port Info', inPort: true },
  ],
  navigation: [
    { id: 'sail', label: 'Sail', inPort: true },
    { id: 'go-ashore', label: 'Go Ashore', inPort: true },
    { id: 'port-call', label: 'Port Call', atSea: true, inPort: true },
    { id: 'auto-sail', label: 'Auto Sail', atSea: true },
    { id: 'options', label: 'Options', atSea: true, inPort: true },
  ],
};

const TAB_LABELS: Record<TabId, string> = {
  fleet: 'Fleet',
  crew: 'Crew',
  info: 'Info',
  navigation: 'Nav',
};

const TABS: TabId[] = ['fleet', 'crew', 'info', 'navigation'];

interface Props {
  portId: string | null;
}

export default function RightTabs({ portId }: Props) {
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [activeContent, setActiveContent] = useState<ContentId>(null);
  const inPort = portId !== null;

  // Close on Escape or right-click
  useEffect(() => {
    if (!activeTab && !activeContent) return undefined;

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (activeContent) setActiveContent(null);
        else setActiveTab(null);
      }
    };
    const onContextmenu = (e: MouseEvent) => {
      e.preventDefault();
      if (activeContent) setActiveContent(null);
      else setActiveTab(null);
    };

    window.addEventListener('keydown', onKeydown);
    window.addEventListener('contextmenu', onContextmenu);
    return () => {
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('contextmenu', onContextmenu);
    };
  }, [activeTab, activeContent]);

  const handleTabClick = (tab: TabId) => {
    setActiveContent(null);
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  const handleOptionClick = (optionId: string) => {
    // Immediate actions
    if (optionId === 'sail') {
      setActiveTab(null);
      setSail();
      return;
    }
    if (optionId === 'go-ashore') {
      setActiveTab(null);
      enterBuilding('4'); // Harbor
      return;
    }
    // Open content overlay
    setActiveContent(optionId);
    setActiveTab(null);
  };

  const closeContent = () => setActiveContent(null);

  const options = activeTab ? TAB_OPTIONS[activeTab].filter((o) =>
    (inPort && o.inPort) || (!inPort && o.atSea),
  ) : [];

  return (
    <>
      {/* Overlay backdrop for tab dropdown */}
      <Transition
        show={activeTab !== null && activeContent === null}
        as={Fragment}
        enter="ease-out duration-100"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-75"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-30"
          onClick={() => setActiveTab(null)}
        />
      </Transition>

      {/* Overlay backdrop for content */}
      <Transition
        show={activeContent !== null}
        as={Fragment}
        enter="ease-out duration-100"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-75"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-30"
          onClick={closeContent}
        />
      </Transition>

      {/* Content overlay */}
      {activeContent && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="pointer-events-auto">
            <ContentPanel id={activeContent} portId={portId} onClose={closeContent} />
          </div>
        </div>
      )}

      {/* Tab buttons + dropdown */}
      <div className="select-none" style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
        {/* Tab dropdown menu (renders above the tabs) */}
        {activeTab && activeContent === null && options.length > 0 && (
          <div
            className="relative z-40"
            style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}
          >
            {options.map((option) => (
              <div
                key={option.id}
                className="flex items-center px-4 py-2.5 cursor-pointer hover:bg-[#c9a84c]/15 transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onClick={() => handleOptionClick(option.id)}
              >
                <span className="text-sm text-gray-200">{option.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* 4 tab buttons */}
        <div className="flex">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <div
                key={tab}
                className={classNames(
                  'flex-1 flex items-center justify-center py-3 cursor-pointer transition-all',
                  'border-r border-white/10 last:border-r-0',
                  isActive
                    ? 'bg-[#c9a84c]/20'
                    : 'hover:bg-[#c9a84c]/10',
                )}
                style={isActive ? { borderTop: '2px solid #c9a84c' } : { borderTop: '2px solid transparent' }}
                onClick={() => handleTabClick(tab)}
              >
                <span
                  className={classNames(
                    'text-xs tracking-wider uppercase font-medium',
                    isActive ? 'text-[#c9a84c]' : 'text-[#666]',
                  )}
                >
                  {TAB_LABELS[tab]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

const PANEL_STYLE: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1a1408 0%, #0d0d1a 100%)',
  border: '2px solid rgba(201,168,76,0.4)',
  minWidth: 280,
  maxWidth: 400,
  boxShadow: '0 0 40px rgba(0,0,0,0.8)',
};

function PanelWrapper({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="rounded" style={PANEL_STYLE}>
      <div className="px-5 py-4">{children}</div>
      <div className="px-5 pb-4">
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

function PanelRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-xs text-gray-100 ml-4">{value}</span>
    </div>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div
        className="text-xs uppercase tracking-wider text-[#c9a84c] mb-1.5 pb-0.5"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.25)' }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function ShipInfoPanel({ onClose }: { onClose: () => void }) {
  const fleet = getPlayerFleet();
  if (!fleet.length) {
    return (
      <PanelWrapper onClose={onClose}>
        <p className="text-gray-400 text-sm text-center">No ships in fleet.</p>
      </PanelWrapper>
    );
  }
  const ship = fleet[0];
  const stats = shipData[ship.id];
  const hullType: HullType = (ship.hull as HullType) || 'teak';
  const hull = hullData[hullType];
  const totalDurability = stats.durability + hull.durabilityBonus;
  const durabilityPct = Math.round((ship.durability / totalDurability) * 100);
  const totalCargo = ship.cargo.reduce((s, c) => s + c.quantity, 0);

  return (
    <PanelWrapper onClose={onClose}>
      <div className="text-center mb-3">
        <div className="text-[#c9a84c] text-sm font-semibold">{ship.name}</div>
        <div className="text-gray-400 text-xs">{stats.name}</div>
      </div>
      <PanelSection title="Hull">
        <PanelRow label="Material" value={hull.name} />
        <PanelRow
          label="Durability"
          value={`${ship.durability} / ${totalDurability} (${durabilityPct}%)`}
        />
      </PanelSection>
      <PanelSection title="Crew & Arms">
        <PanelRow label="Crew" value={`${ship.crew} / ${stats.maximumCrew}`} />
        <PanelRow label="Guns" value={`${stats.usedGuns} / ${stats.maximumGuns}`} />
        <PanelRow label="Tacking" value={stats.tacking} />
        <PanelRow label="Power" value={stats.power} />
      </PanelSection>
      <PanelSection title="Cargo">
        <PanelRow label="Used" value={`${totalCargo} / ${stats.capacity}`} />
      </PanelSection>
    </PanelWrapper>
  );
}

function CargoInfoPanel({ onClose }: { onClose: () => void }) {
  const fleet = getPlayerFleet();
  const provisionTotals: { [type: string]: number } = {};
  const goodsTotals: { [type: string]: number } = {};
  const provTypes = new Set(['food', 'water', 'lumber', 'shot']);

  fleet.forEach((ship) => {
    ship.cargo.forEach((item) => {
      if (provTypes.has(item.type)) {
        provisionTotals[item.type] = (provisionTotals[item.type] || 0) + item.quantity;
      } else {
        goodsTotals[item.type] = (goodsTotals[item.type] || 0) + item.quantity;
      }
    });
  });

  const provEntries = Object.entries(provisionTotals);
  const goodsEntries = Object.entries(goodsTotals);

  return (
    <PanelWrapper onClose={onClose}>
      <PanelSection title="Provisions">
        {provEntries.length ? (
          provEntries.map(([type, qty]) => (
            <PanelRow
              key={type}
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              value={qty}
            />
          ))
        ) : (
          <p className="text-gray-500 text-xs italic">No provisions loaded.</p>
        )}
      </PanelSection>
      <PanelSection title="Trade Goods">
        {goodsEntries.length ? (
          goodsEntries.map(([type, qty]) => (
            <PanelRow
              key={type}
              label={(goodsData as Record<string, { name: string }>)[type]?.name ?? type}
              value={qty}
            />
          ))
        ) : (
          <p className="text-gray-500 text-xs italic">No trade goods loaded.</p>
        )}
      </PanelSection>
    </PanelWrapper>
  );
}

const DAILY_MATE_WAGE = 10;

function WagesPanel({ onClose }: { onClose: () => void }) {
  const mates = getMates();
  const totalPerDay = mates.length * DAILY_MATE_WAGE;
  const totalPerMonth = totalPerDay * 30;

  return (
    <PanelWrapper onClose={onClose}>
      <PanelSection title="Crew Wages">
        {mates.map((mate) => (
          <PanelRow
            key={mate.sailorId}
            label={mate.name}
            value={`${DAILY_MATE_WAGE} gold/day`}
          />
        ))}
      </PanelSection>
      <div
        className="pt-2 mt-1"
        style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}
      >
        <PanelRow label="Daily total" value={`${totalPerDay} gold`} />
        <PanelRow label="Monthly est." value={`${totalPerMonth} gold`} />
      </div>
    </PanelWrapper>
  );
}

function JobDutyPanel({ onClose }: { onClose: () => void }) {
  const [confirming, setConfirming] = useState<string | null>(null);
  const mates = getMates();
  const playerSailorId = getPlayerSailorId();
  const eligible = mates.filter((m) => m.sailorId !== playerSailorId);
  const confirmMate = confirming ? mates.find((m) => m.sailorId === confirming) : null;

  if (confirmMate) {
    return (
      <PanelWrapper onClose={onClose}>
        <p className="text-gray-200 text-sm text-center mb-4">
          Assign <span className="text-[#c9a84c]">{confirmMate.name}</span> as First Mate?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 py-1 text-sm bg-[#c9a84c]/20 hover:bg-[#c9a84c]/30 text-[#c9a84c] rounded border border-[#c9a84c]/40"
            onClick={() => {
              setFirstMate(confirmMate.sailorId);
              setConfirming(null);
              onClose();
            }}
          >
            Yes
          </button>
          <button
            type="button"
            className="flex-1 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
            onClick={() => setConfirming(null)}
          >
            No
          </button>
        </div>
      </PanelWrapper>
    );
  }

  return (
    <PanelWrapper onClose={onClose}>
      <div
        className="text-xs uppercase tracking-wider text-[#c9a84c] mb-2 pb-0.5"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.25)' }}
      >
        Select First Mate
      </div>
      {eligible.map((mate) => {
        const isCurrent = mate.role === 'firstMate';
        return (
          <div
            key={mate.sailorId}
            className={classNames(
              'flex items-center justify-between px-2 py-1.5 rounded cursor-pointer mb-0.5',
              isCurrent
                ? 'bg-[#c9a84c]/15 border border-[#c9a84c]/30'
                : 'hover:bg-white/5',
            )}
            onClick={() => !isCurrent && setConfirming(mate.sailorId)}
          >
            <span className="text-sm text-gray-200">{mate.name}</span>
            <span className="text-xs text-gray-400">{getRoleDisplay(mate.role)}</span>
          </div>
        );
      })}
      {eligible.length === 0 && (
        <p className="text-gray-500 text-xs italic">No eligible mates available.</p>
      )}
    </PanelWrapper>
  );
}

function RationsPanel({ onClose }: { onClose: () => void }) {
  const fleet = getPlayerFleet();
  const days = getDaysProvisionsWillLast();

  const daysColor = days >= 30 ? '#c9a84c' : days >= 10 ? '#e0a020' : '#ef4444';

  return (
    <PanelWrapper onClose={onClose}>
      <div className="text-center mb-3">
        <div className="text-3xl font-bold" style={{ color: daysColor }}>
          {Number.isFinite(days) ? days : 0}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">days of provisions remaining</div>
      </div>
      {fleet.map((ship, i) => {
        const food = ship.cargo.find((c) => c.type === 'food')?.quantity ?? 0;
        const water = ship.cargo.find((c) => c.type === 'water')?.quantity ?? 0;
        return (
          <PanelSection key={i} title={ship.name}>
            <PanelRow label="Food" value={food} />
            <PanelRow label="Water" value={water} />
            <PanelRow label="Crew" value={ship.crew} />
          </PanelSection>
        );
      })}
    </PanelWrapper>
  );
}

function AutoSailPanel({ onClose }: { onClose: () => void }) {
  const playerPos = state.fleets['1'].position;

  const portsWithDist = regularPorts.map((port, i) => {
    const portId = String(i + 1);
    const adjacentPos = positionAdjacentToPort(portId);
    const dx = adjacentPos.x - (playerPos?.x ?? 0);
    const dy = adjacentPos.y - (playerPos?.y ?? 0);
    const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
    return { portId, name: port.name, dist };
  }).sort((a, b) => a.dist - b.dist);

  return (
    <div className="rounded" style={PANEL_STYLE}>
      <div className="px-5 pt-4 pb-2">
        <div
          className="text-xs uppercase tracking-wider text-[#c9a84c] mb-2 pb-0.5"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.25)' }}
        >
          Auto Sail to Port
        </div>
        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
          {portsWithDist.map(({ portId, name, dist }) => (
            <div
              key={portId}
              className="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer hover:bg-white/5"
              onClick={() => {
                setAutoSailTarget(portId);
                onClose();
              }}
            >
              <span className="text-sm text-gray-200">{name}</span>
              <span className="text-xs text-gray-500">{dist} tiles</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pb-4">
        <button
          type="button"
          className="w-full py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function PortCallPanel({ onClose }: { onClose: () => void }) {
  const playerPos = state.fleets['1'].position;

  const portsWithDist = regularPorts.map((port, i) => {
    const portId = String(i + 1);
    const adjacentPos = positionAdjacentToPort(portId);
    const dx = adjacentPos.x - (playerPos?.x ?? 0);
    const dy = adjacentPos.y - (playerPos?.y ?? 0);
    const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
    return { portId, name: port.name, dist };
  }).sort((a, b) => a.dist - b.dist);

  return (
    <div className="rounded" style={PANEL_STYLE}>
      <div className="px-5 pt-4 pb-2">
        <div
          className="text-xs uppercase tracking-wider text-[#c9a84c] mb-2 pb-0.5"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.25)' }}
        >
          Select Port
        </div>
        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
          {portsWithDist.map(({ portId, name, dist }) => (
            <div
              key={portId}
              className="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer hover:bg-white/5"
              onClick={() => {
                const pos = positionAdjacentToPort(portId);
                dock(pos);
                onClose();
              }}
            >
              <span className="text-sm text-gray-200">{name}</span>
              <span className="text-xs text-gray-500">{dist} tiles</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pb-4">
        <button
          type="button"
          className="w-full py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ContentPanel({
  id,
  portId,
  onClose,
}: {
  id: string;
  portId: string | null;
  onClose: () => void;
}) {
  if (id === 'fleet-info') return <Fleet />;
  if (id === 'mate-info' || id === 'mate-info-crew') return <Mates />;
  if (id === 'items') return <Items />;
  if (id === 'options') return <SaveLoad />;
  if (id === 'hero-info') return <HeroInfo onClose={onClose} />;
  if (id === 'discovery') return <Discovery onClose={onClose} />;
  if (id === 'port-map' && portId) return <PortMap onClose={onClose} />;
  if (id === 'chart') return <Chart onClose={onClose} />;
  if (id === 'ship-info') return <ShipInfoPanel onClose={onClose} />;
  if (id === 'cargo-info') return <CargoInfoPanel onClose={onClose} />;
  if (id === 'wages') return <WagesPanel onClose={onClose} />;
  if (id === 'job-duty') return <JobDutyPanel onClose={onClose} />;
  if (id === 'rations') return <RationsPanel onClose={onClose} />;
  if (id === 'port-call') return <PortCallPanel onClose={onClose} />;
  if (id === 'auto-sail') return <AutoSailPanel onClose={onClose} />;
  if (id === 'port-info' && portId) return (
    <div className="rounded" style={PANEL_STYLE}>
      <PortInfo portId={portId} />
      <div className="px-5 pb-4">
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

  // Stub for unimplemented options
  return (
    <div
      className="rounded p-6 text-center"
      style={PANEL_STYLE}
    >
      <div className="text-gray-400 text-sm mb-4">Not yet implemented</div>
      <button
        type="button"
        className="px-6 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}
