import React from 'react';

import { hudClass } from './interfaceUtils';
import RightTabs from './port/RightTabs';
import PortInfo from './port/PortInfo';
import Indicators from './world/Indicators';

interface Props {
  portId: string | null;
}

export default function Right({ portId }: Props) {
  const inPort = portId !== null;

  return (
    <div className={`${hudClass} flex flex-col justify-between`}>
      <div className="flex-1 min-h-0 overflow-hidden">
        {inPort ? (
          <PortInfo portId={portId} />
        ) : (
          <Indicators hidden={false} />
        )}
      </div>
      <RightTabs portId={portId} />
    </div>
  );
}
