import React, { ReactNode, useRef } from 'react';
import useBuilding from './hooks/useBuilding';
import {
  CharacterMessageBoxType,
  VendorMessageBoxType,
} from '../quest/getMessageBoxes';
import BuildingMenu from '../common/BuildingMenu';
import BuildingWrapper from './BuildingWrapper';
import { getFirstMateId, getGold, isLisbon, getPlayerSailorId } from '../../state/selectors';
import { getCrewNeeded, getPlayerFleet } from '../../state/selectorsFleet';
import { CREW_COST, recruitCrew, dismissCrew, treatCrew, gambleGold } from '../../state/actionsPort';
import { shipData } from '../../data/shipData';

const pubOptions = [
  'Recruit Crew',
  'Dismiss Crew',
  'Treat',
  'Meet',
  'Waitress',
  'Gamble',
] as const;
type PubOptions = typeof pubOptions[number];

const TREAT_COST = 50;
const GAMBLE_AMOUNT = 100;

export default function Pub() {
  const { selectOption, next, back, reset, state } = useBuilding<PubOptions>();
  const excessCrewRef = useRef(0);
  const gambleWonRef = useRef(false);

  const { option, step } = state;

  let vendorMessage: VendorMessageBoxType = {
    body: 'Hey sailor, you\u2019ll like our wine!',
  };

  // Carlotta greets instead of the regular vendor
  if (isLisbon()) {
    vendorMessage = null;
  }

  let characterMessage: CharacterMessageBoxType = null;

  const hasFleet = getPlayerFleet().length > 0;

  const menu: ReactNode = (
    <BuildingMenu
      options={pubOptions.map((s) => ({
        label: s,
        value: s,
        disabled: !hasFleet && (s === 'Recruit Crew' || s === 'Dismiss Crew'),
      }))}
      onSelect={(s) => selectOption(s)}
      onCancel={back}
      hidden={option !== null || step === -1}
    />
  );

  const children: ReactNode = null;

  if (option === 'Recruit Crew') {
    vendorMessage = null;

    const gold = getGold();
    const crewNeeded = getCrewNeeded();

    if (step === 0) {
      if (!crewNeeded) {
        characterMessage = {
          body: 'We have enough men in our crew.',
          characterId: getFirstMateId(),
          acknowledge: back,
        };
      } else if (gold < CREW_COST) {
        characterMessage = {
          body: "We don\u2019t have enough gold.",
          characterId: getFirstMateId(),
          acknowledge: back,
        };
      } else {
        characterMessage = {
          body: 'Shall we recruit some men for our crew?',
          characterId: getFirstMateId(),
          confirm: {
            yes: next,
            no: back,
          },
        };
      }
    }

    if (step === 1) {
      characterMessage = {
        body: 'Hey! Do any of you tough sailors want to join our crew?',
        characterId: getPlayerSailorId(),
        acknowledge: next,
      };
    }

    if (step === 2) {
      let count = 0;

      if (crewNeeded * CREW_COST > gold) {
        count = Math.floor(gold / CREW_COST);
      } else {
        count = crewNeeded;
      }

      characterMessage = {
        body: `We rounded up ${count} men, at the cost of ${
          count * CREW_COST
        } gold pieces.`,
        characterId: getFirstMateId(),
        acknowledge: () => {
          recruitCrew(count);
          reset();
        },
      };
    }
  }

  if (option === 'Dismiss Crew') {
    vendorMessage = null;

    if (step === 0) {
      const fleet = getPlayerFleet();
      let excess = 0;
      fleet.forEach((ship) => {
        const { minimumCrew } = shipData[ship.id];
        excess += Math.max(0, ship.crew - minimumCrew);
      });
      excessCrewRef.current = excess;

      if (!excess) {
        characterMessage = {
          body: 'All crew are needed to man the ships. There is no one to dismiss.',
          characterId: getFirstMateId(),
          acknowledge: back,
        };
      } else {
        characterMessage = {
          body: `We have ${excess} crew above minimum requirements. Shall we let them go?`,
          characterId: getFirstMateId(),
          confirm: { yes: next, no: back },
        };
      }
    }

    if (step === 1) {
      characterMessage = {
        body: `${excessCrewRef.current} crew members have been dismissed.`,
        characterId: getFirstMateId(),
        acknowledge: () => {
          dismissCrew();
          reset();
        },
      };
    }
  }

  if (option === 'Treat') {
    const gold = getGold();

    if (step === 0) {
      if (gold < TREAT_COST) {
        vendorMessage = {
          body: 'You can\u2019t even afford a round of drinks!',
          acknowledge: back,
        };
      } else {
        vendorMessage = {
          body: `Shall I bring a round for your crew? That\u2019ll be ${TREAT_COST} gold.`,
          confirm: { yes: next, no: back },
        };
      }
    }

    if (step === 1) {
      treatCrew(TREAT_COST);
      vendorMessage = {
        body: 'Your crew raises their cups. Spirits are high!',
        acknowledge: reset,
      };
    }
  }

  if (option === 'Meet') {
    vendorMessage = {
      body: 'Hmm, nobody of particular interest seems to be around today.',
      acknowledge: back,
    };
  }

  if (option === 'Waitress') {
    if (isLisbon()) {
      vendorMessage = {
        body: 'She gives you a coy smile, but seems busy with the other patrons.',
        acknowledge: back,
      };
    } else {
      vendorMessage = {
        body: 'The waitress smiles politely but has nothing special to say.',
        acknowledge: back,
      };
    }
  }

  if (option === 'Gamble') {
    const gold = getGold();

    if (step === 0) {
      if (gold < GAMBLE_AMOUNT) {
        vendorMessage = {
          body: `You need at least ${GAMBLE_AMOUNT} gold to play.`,
          acknowledge: back,
        };
      } else {
        vendorMessage = {
          body: `Care to wager ${GAMBLE_AMOUNT} gold on a game of dice?`,
          confirm: { yes: next, no: back },
        };
      }
    }

    if (step === 1) {
      gambleWonRef.current = Math.random() < 0.5;
      vendorMessage = {
        body: gambleWonRef.current
          ? `The dice roll in your favour! You win ${GAMBLE_AMOUNT} gold.`
          : `Bad luck! You lose ${GAMBLE_AMOUNT} gold.`,
        acknowledge: () => {
          gambleGold(GAMBLE_AMOUNT, gambleWonRef.current);
          reset();
        },
      };
    }
  }

  return (
    <BuildingWrapper
      buildingId="2"
      vendorMessageBox={vendorMessage}
      characterMessageBox={characterMessage}
      menu={menu}
    >
      {children}
    </BuildingWrapper>
  );
}
