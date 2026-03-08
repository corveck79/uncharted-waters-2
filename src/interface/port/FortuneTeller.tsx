import React, { useState } from 'react';

import useBuilding from './hooks/useBuilding';
import { VendorMessageBoxType } from '../quest/getMessageBoxes';
import BuildingMenu from '../common/BuildingMenu';
import BuildingWrapper from './BuildingWrapper';
import { getMates } from '../../state/selectors';

const fortuneOptions = ['Life', 'Career', 'Love', 'Mates'] as const;
type FortuneOptions = typeof fortuneOptions[number];

const lifeReadings = [
  'The stars speak of a long and adventurous life. Many seas await you, brave sailor.',
  'Dark clouds linger on your horizon, but courage will see you through every storm.',
  'Your voyage has only just begun. The greatest discoveries still lie ahead.',
  'Fortune smiles upon the bold. Your name will be known in every port.',
];

const careerReadings = [
  'Wealth and renown await those who dare sail beyond the horizon.',
  'The trade winds will carry your fortune if you follow the routes less traveled.',
  'I see treasure — buried in distant lands, guarded by those who would not yield easily.',
  'A great discovery will bring you everlasting fame. Trust your instincts on the open sea.',
];

const loveReadings = [
  'A mysterious figure in a distant port holds a piece of your heart already.',
  'Romance blooms in unlikely harbors. Keep your eyes open at the next port of call.',
  'The sea is a jealous mistress — but a patient heart will find its reward.',
  'Someone waits faithfully for your return. Do not keep them waiting too long.',
];

export default function FortuneTeller() {
  const { selectOption, next, back, state: buildingState } =
    useBuilding<FortuneOptions>(true);

  const [mateIndex, setMateIndex] = useState(0);

  const { option, step } = buildingState;

  // Pick deterministic readings based on current gold (changes over time)
  const seed = Math.floor(Date.now() / 60000) % 4; // changes each minute

  let vendorMessage: VendorMessageBoxType = {
    body: 'Step closer… the spirits speak to those who dare listen. What wisdom do you seek?',
  };

  const menu = (
    <BuildingMenu
      options={fortuneOptions.map((s) => ({
        label: s,
        value: s,
      }))}
      onSelect={(s) => {
        setMateIndex(0);
        selectOption(s);
      }}
      onCancel={back}
      hidden={option !== null || step === -1}
    />
  );

  if (option === 'Life') {
    vendorMessage = {
      body: lifeReadings[seed],
      acknowledge: back,
    };
  }

  if (option === 'Career') {
    vendorMessage = {
      body: careerReadings[seed],
      acknowledge: back,
    };
  }

  if (option === 'Love') {
    vendorMessage = {
      body: loveReadings[seed],
      acknowledge: back,
    };
  }

  if (option === 'Mates') {
    const mates = getMates();

    if (!mates.length) {
      vendorMessage = {
        body: 'You sail alone. No companions travel with you yet.',
        acknowledge: back,
      };
    } else {
      const mate = mates[mateIndex];
      const isLast = mateIndex >= mates.length - 1;

      const statLines = [
        `Leadership: ${mate.stats.leadership}`,
        `Seamanship: ${mate.stats.seamanship}`,
        `Knowledge:  ${mate.stats.knowledge}`,
        `Courage:    ${mate.stats.courage}`,
        `Charm:      ${mate.stats.charm}`,
        `Luck:       ${mate.stats.luck}`,
      ].join('  ');

      const skills = mate.skills.length ? mate.skills.join(', ') : 'none';

      vendorMessage = {
        body: `${mate.name} (age ${mate.age})\n${statLines}\nSkills: ${skills}\nNav Lv ${mate.navigationLevel}  Battle Lv ${mate.battleLevel}`,
        acknowledge: isLast
          ? back
          : () => {
              setMateIndex(mateIndex + 1);
              next();
            },
      };
    }
  }

  if (step === -1) {
    vendorMessage = {
      body: 'The spirits grow quiet. Return when fate calls you back.',
      acknowledge: back,
    };
  }

  return (
    <BuildingWrapper
      buildingId="12"
      vendorMessageBox={vendorMessage}
      menu={menu}
    />
  );
}
