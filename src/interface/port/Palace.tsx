import React, { ReactNode } from 'react';

import useBuilding from './hooks/useBuilding';
import { VendorMessageBoxType } from '../quest/getMessageBoxes';
import BuildingMenu from '../common/BuildingMenu';
import BuildingWrapper from './BuildingWrapper';
import { receiveGold, defect, receiveShipReward, getAvailableSailorId } from '../../state/actionsPort';
import { getPortData } from '../../game/port/portUtils';
import { getPlayerNationalityIndex, getNewShipsAvailable } from '../../state/selectors';
import { shipData } from '../../data/shipData';
import ShipyardShipBox from './shipyard/ShipyardShipBox';
import state from '../../state/state';

const palaceOptions = ['Meet Ruler', 'Defect', 'Gold', 'Ship'] as const;
type PalaceOptions = typeof palaceOptions[number];

// Order matches portData allegiances array: [Portugal, Spain, Ottoman, England, Italy, Holland]
const nationalities = ['Portugal', 'Spain', 'Ottoman', 'England', 'Italy', 'Holland'];

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

  let children: ReactNode;

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
    const allegiances = port && !port.isSupplyPort ? port.allegiances : [];
    const maxAllegiance = allegiances.length ? Math.max(...allegiances) : 0;
    const portNatIdx = maxAllegiance >= 50 ? allegiances.indexOf(maxAllegiance) : -1;
    const playerNatIdx = getPlayerNationalityIndex();

    if (portNatIdx === -1) {
      vendorMessage = {
        body: 'There is no powerful ruler here to pledge your loyalty to.',
        acknowledge: back,
      };
    } else if (portNatIdx === playerNatIdx) {
      vendorMessage = {
        body: `You are already loyal to ${nationality}. There is nothing to defect to here.`,
        acknowledge: back,
      };
    } else {
      const portNationality = nationalities[portNatIdx];
      vendorMessage = {
        body: `Do you wish to renounce your previous allegiance and pledge your loyalty to ${portNationality}?`,
        confirm: {
          yes: () => {
            defect(portNatIdx);
            back();
          },
          no: back,
        },
      };
    }
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
    const portId = state.portId;
    const hasReceivedShip = portId && (state.shipRewardsReceived || []).includes(portId);

    if (hasReceivedShip) {
      vendorMessage = {
        body: 'The ruler has already bestowed you a vessel. Godspeed on your voyages.',
        acknowledge: back,
      };
    } else if (!state.quests.length) {
      vendorMessage = {
        body: 'You have not yet proven yourself. Complete missions for the guild and return.',
        acknowledge: back,
      };
    } else if (!getAvailableSailorId()) {
      vendorMessage = {
        body: 'You have no available sailors to captain another vessel.',
        acknowledge: back,
      };
    } else {
      const availableShips = getNewShipsAvailable();
      if (!availableShips.length) {
        vendorMessage = {
          body: 'The ruler has no ships to offer at this port.',
          acknowledge: back,
        };
      } else {
        const rewardShipId = availableShips[0].shipId;
        const rewardShip = shipData[rewardShipId];
        children = <ShipyardShipBox shipId={rewardShipId} />;
        vendorMessage = {
          body: `In recognition of your service, the ruler bestows upon you a ${rewardShip.name}!`,
          confirm: {
            yes: () => {
              receiveShipReward(portId!, rewardShipId, rewardShip.name);
              back();
            },
            no: back,
          },
        };
      }
    }
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
    >
      {children}
    </BuildingWrapper>
  );
}
