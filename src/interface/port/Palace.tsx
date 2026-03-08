import React from 'react';

import useBuilding from './hooks/useBuilding';
import { VendorMessageBoxType } from '../quest/getMessageBoxes';
import BuildingMenu from '../common/BuildingMenu';
import BuildingWrapper from './BuildingWrapper';
import { receiveGold } from '../../state/actionsPort';
import { getPortData } from '../../game/port/portUtils';
import state from '../../state/state';

const palaceOptions = ['Meet Ruler', 'Defect', 'Gold', 'Ship'] as const;
type PalaceOptions = typeof palaceOptions[number];

const nationalities = ['Portugal', 'England', 'Spain', 'Holland', 'Italy', 'Ottoman'];

const getDominantNationality = (allegiances: number[]) => {
  const maxIdx = allegiances.indexOf(Math.max(...allegiances));
  return nationalities[maxIdx] ?? 'an unknown nation';
};

export default function Palace() {
  const { selectOption, back, state: buildingState } =
    useBuilding<PalaceOptions>(true);

  const { option, step } = buildingState;

  const port = state.portId ? getPortData(state.portId) : null;
  const portName = port?.name ?? 'this port';
  const nationality =
    port && !port.isSupplyPort ? getDominantNationality(port.allegiances) : 'the local ruler';
  const goldReward = port && !port.isSupplyPort ? Math.max(100, Math.floor(port.economy / 5)) : 100;

  let vendorMessage: VendorMessageBoxType = {
    body: `This is the Palace of ${portName}. The ruler of ${nationality} grants you an audience.`,
  };

  const menu = (
    <BuildingMenu
      options={palaceOptions.map((s) => ({
        label: s,
        value: s,
      }))}
      onSelect={(s) => selectOption(s)}
      onCancel={back}
      hidden={option !== null || step === -1}
    />
  );

  if (option === 'Meet Ruler') {
    if (step === 0) {
      vendorMessage = {
        body: `Welcome, brave sailor! The ruler of ${nationality} is pleased to receive you in ${portName}.`,
        acknowledge: back,
      };
    }
  }

  if (option === 'Defect') {
    vendorMessage = {
      body: 'You must prove your loyalty to another nation before defecting. Earn renown in foreign lands first.',
      acknowledge: back,
    };
  }

  if (option === 'Gold') {
    if (step === 0) {
      if (!state.quests.length) {
        vendorMessage = {
          body: 'You have not yet proven yourself. Complete missions for the guild and return.',
          acknowledge: back,
        };
      } else {
        vendorMessage = {
          body: `In recognition of your services, the ruler rewards you with ${goldReward} gold pieces!`,
          acknowledge: () => {
            receiveGold(goldReward);
            back();
          },
        };
      }
    }
  }

  if (option === 'Ship') {
    vendorMessage = {
      body: 'The ruler has no ships to offer at this time. Continue your voyages and return when you have proven your worth.',
      acknowledge: back,
    };
  }

  if (step === -1) {
    vendorMessage = {
      body: `May your voyages bring glory to ${nationality}. Farewell, sailor.`,
      acknowledge: back,
    };
  }

  return (
    <BuildingWrapper
      buildingId="6"
      vendorMessageBox={vendorMessage}
      menu={menu}
    />
  );
}
