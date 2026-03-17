import React, { useState } from 'react';

import Shipyard from './shipyard/Shipyard';
import BuildingMenu from '../common/BuildingMenu';
import Harbor from './harbor/Harbor';
import BuildingWrapper from './BuildingWrapper';
import { buildings } from '../../data/buildingData';
import useBuilding from './hooks/useBuilding';
import Lodge from './Lodge';
import Bank from './bank/Bank';
import Church from './Church';
import ItemShop from './ItemShop';
import Pub from './Pub';
import Market from './Market';
import Palace from './Palace';
import Guild from './Guild';
import FortuneTeller from './FortuneTeller';
import BlockadeGuard from './BlockadeGuard';
import { isPortBlockaded, getBlockadeInfo } from '../../state/selectors';

const BLOCKADED_BUILDINGS = ['6', '7'];

interface Props {
  buildingId: string;
}

export default function Building({ buildingId }: Props) {
  const { options } = buildings[buildingId];
  const [blockadeCleared, setBlockadeCleared] = useState(false);

  if (!blockadeCleared && BLOCKADED_BUILDINGS.includes(buildingId) && isPortBlockaded()) {
    const info = getBlockadeInfo()!;
    return (
      <BlockadeGuard
        buildingId={buildingId}
        nation={info.nation}
        friendly={info.friendly}
        onClear={() => setBlockadeCleared(true)}
      />
    );
  }

  if (buildingId === '1') {
    return <Market />;
  }

  if (buildingId === '2') {
    return <Pub />;
  }

  if (buildingId === '3') {
    return <Shipyard />;
  }

  if (buildingId === '4') {
    return <Harbor />;
  }

  if (buildingId === '5') {
    return <Lodge />;
  }

  if (buildingId === '6') {
    return <Palace />;
  }

  if (buildingId === '7') {
    return <Guild />;
  }

  if (buildingId === '9') {
    return <Bank />;
  }

  if (buildingId === '10') {
    return <ItemShop />;
  }

  if (buildingId === '11') {
    return <Church />;
  }

  if (buildingId === '12') {
    return <FortuneTeller />;
  }

  const { back } = useBuilding();

  const menu = (
    <BuildingMenu
      options={options.map((option) => ({
        label: option,
        value: option,
        disabled: option !== 'Sail',
      }))}
      onSelect={() => {}}
      onCancel={back}
    />
  );

  return (
    <BuildingWrapper
      buildingId={buildingId}
      vendorMessageBox={{
        body: 'This feature is not implemented yet. Press ESC to exit this building.',
      }}
      menu={menu}
    />
  );
}
