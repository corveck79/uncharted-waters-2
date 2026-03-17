import React from 'react';

import Assets from '../../../assets';
import { shipData } from '../../../data/shipData';

interface Props {
  shipId: string;
  customShipName?: string;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-sm opacity-70 whitespace-nowrap">{label}</span>
      <span className="text-xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export default function ShipyardShipBox({ shipId, customShipName }: Props) {
  const {
    name,
    durability,
    tacking,
    power,
    capacity,
    usedGuns,
    maximumGuns,
    minimumCrew,
    usedCrew,
    maximumCrew,
  } = shipData[shipId];

  const cargo = capacity - usedGuns - usedCrew;

  return (
    <div
      className="absolute top-[256px] left-[180px] w-[736px] h-[304px]"
      style={{
        background: `url('${Assets.images('dialogShip').toDataURL()}')`,
        backgroundSize: '736px 304px',
      }}
    >
      <div className="flex items-center h-full px-8">
        <img
          src={Assets.ships(shipId)}
          className="w-[256px] h-[192px]"
          alt=""
        />
        <div className="flex-1 pl-8">
          <div className="text-2xl text-blue-600 text-center mb-3">
            {customShipName || name}
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            <Stat label="Durability" value={durability} />
            <Stat label="Tacking" value={tacking} />
            <Stat label="Power" value={power} />
            <Stat label="Capacity" value={capacity} />
            <Stat label="Cargo" value={cargo} />
            <Stat label="Guns" value={`${usedGuns} / ${maximumGuns}`} />
            <div className="col-span-2 flex items-baseline justify-between gap-2">
              <span className="text-sm opacity-70 whitespace-nowrap">Crew (min / std / max)</span>
              <span className="text-xl font-semibold tabular-nums">{minimumCrew} / {usedCrew} / {maximumCrew}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
