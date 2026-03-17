import React, { useState } from 'react';

import BuildingWrapper from './BuildingWrapper';
import { payBlockadeBribe, exitBuilding } from '../../state/actionsPort';
import state from '../../state/state';

const BRIBE_COST = 500;

interface Props {
  buildingId: string;
  nation: string;
  friendly: boolean;
  onClear: () => void;
}

type GuardState = 'confrontation' | 'bribed' | 'no_gold';

export default function BlockadeGuard({ buildingId, nation, friendly, onClear }: Props) {
  const [guardState, setGuardState] = useState<GuardState>('confrontation');

  if (friendly) {
    return (
      <BuildingWrapper
        buildingId={buildingId}
        vendorMessageBox={{
          body: `${nation} soldiers stand guard, but your reputation precedes you. "Your papers are in order. You may pass."`,
          acknowledge: onClear,
        }}
      />
    );
  }

  if (guardState === 'bribed') {
    return (
      <BuildingWrapper
        buildingId={buildingId}
        vendorMessageBox={{
          body: 'The guard pockets the gold without a word and steps aside.',
          acknowledge: onClear,
        }}
      />
    );
  }

  if (guardState === 'no_gold') {
    return (
      <BuildingWrapper
        buildingId={buildingId}
        vendorMessageBox={{
          body: '"You don\'t have enough gold. Get out of here."',
          acknowledge: exitBuilding,
        }}
      />
    );
  }

  // confrontation state — confirm acts as yes/no choice
  const handleBribe = () => {
    if (state.gold < BRIBE_COST) {
      setGuardState('no_gold');
    } else {
      payBlockadeBribe(BRIBE_COST);
      setGuardState('bribed');
    }
  };

  return (
    <BuildingWrapper
      buildingId={buildingId}
      vendorMessageBox={{
        body: `A ${nation} soldier blocks your path. "Halt! This port is under ${nation} control. You have no business here." He eyes your purse. "...Unless you make it worth my while. ${BRIBE_COST} gold."`,
        confirm: {
          yes: handleBribe,
          no: exitBuilding,
        },
      }}
    />
  );
}
