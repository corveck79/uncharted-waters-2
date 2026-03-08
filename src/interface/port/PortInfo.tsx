import React from 'react';

import {
  getRegionOrIfSupplyPort,
  getPortData,
} from '../../game/port/portUtils';

interface Props {
  portId: string;
}

// TODO Investments
export default function PortInfo({ portId }: Props) {
  const port = getPortData(portId);

  let economy = 0;
  let industry = 0;

  if (!port.isSupplyPort) {
    ({ economy, industry } = port);
  }

  const { name } = port;

  return (
    <div className="p-5">
      <div className="text-xl font-bold whitespace-nowrap text-[#c9a84c]">{name}</div>
      <div
        className="text-sm text-[#aaaaaa] mb-4 pb-4"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}
      >
        {getRegionOrIfSupplyPort(portId)}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-[#aaaaaa]">Economy</span>
          <span className="font-bold">{economy}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-[#666]">↳ Invest.</span>
          <span className="text-sm text-[#888]">0</span>
        </div>

        <div
          className="flex justify-between items-baseline pt-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="text-sm text-[#aaaaaa]">Industry</span>
          <span className="font-bold">{industry}</span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-[#666]">↳ Invest.</span>
          <span className="text-sm text-[#888]">0</span>
        </div>

        <div
          className="flex justify-between items-baseline pt-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="text-sm text-[#aaaaaa]">Price Index</span>
          <span className="font-bold text-[#c9a84c]">100%</span>
        </div>
      </div>
    </div>
  );
}
