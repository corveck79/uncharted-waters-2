import React, { ReactNode, useState } from 'react';

import {
  classNames,
  getCoins,
  getDate,
  getHoursMinutes,
  getIngots,
  hudClass,
} from './interfaceUtils';
import updateInterface from '../state/updateInterface';
import Sound from './sound/Sound';
import Fleet from './Fleet';
import Popover from './common/Popover';
import Items from './Items';
import Mates from './Mates';
import SaveLoad from './SaveLoad';

interface Props {
  portId: string | null;
  buildingId: string | null;
  timePassed: number;
  gold: number;
  children?: ReactNode;
}

export default function Left({
  portId,
  buildingId,
  timePassed,
  gold,
  children = null,
}: Props) {
  const [dayAtSea, setDayAtSea] = useState(0);

  updateInterface.dayAtSea = (d) => {
    setDayAtSea(d);
  };

  const inPort = portId !== null;

  return (
    <div
      className={classNames(hudClass, 'flex flex-col justify-between')}
      data-test="left"
    >
      <div className="p-5">
        <div className="text-xl font-bold whitespace-nowrap text-[#c9a84c]">
          {getDate(timePassed)}
        </div>
        <div className="mb-6 text-sm text-[#aaaaaa]">
          {inPort ? getHoursMinutes(timePassed) : `Day ${dayAtSea}`}
        </div>
        <div
          className="mb-5"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}
        />
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-sm text-[#aaaaaa]">Ingots</span>
          <span className="font-bold">{getIngots(gold)}</span>
        </div>
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-sm text-[#aaaaaa]">Coins</span>
          <span className="font-bold">{getCoins(gold)}</span>
        </div>
        {Boolean(children) && <div>{children}</div>}
      </div>
      <div className="select-none" style={{ borderTop: '1px solid rgba(201,168,76,0.2)' }}>
        {inPort && (
          <>
            <Popover label="Mates">
              <Mates />
            </Popover>
            <Popover label="Fleet">
              <Fleet />
            </Popover>
            <Popover label="Items">
              <Items />
            </Popover>
          </>
        )}
        <Popover label="Menu">
          <SaveLoad />
        </Popover>
      </div>
      <Sound portId={portId} buildingId={buildingId} />
    </div>
  );
}
