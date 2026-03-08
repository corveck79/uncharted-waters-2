import React from 'react';

import useBuilding from './hooks/useBuilding';
import { VendorMessageBoxType } from '../quest/getMessageBoxes';
import BuildingMenu from '../common/BuildingMenu';
import BuildingWrapper from './BuildingWrapper';
import { getPortData } from '../../game/port/portUtils';
import { markets, regions } from '../../data/portExtraData';
import state from '../../state/state';

const guildOptions = ['Job Assignment', 'Country Info'] as const;
type GuildOptions = typeof guildOptions[number];

const jobTitles = [
  'Merchant vessel needs escort to the nearest port.',
  'Coastal survey — map uncharted reefs off the cape.',
  'Urgent cargo delivery to a port three days north.',
  'Rescue stranded crew from a disabled vessel.',
  'Transport a dignitary to a distant port in safety.',
];

export default function Guild() {
  const { selectOption, back, state: buildingState } =
    useBuilding<GuildOptions>(true);

  const { option, step } = buildingState;

  const port = state.portId ? getPortData(state.portId) : null;
  const portName = port?.name ?? 'this port';

  let marketName = 'Unknown';
  let regionName = 'Unknown';
  let economy = 0;
  let industry = 0;

  if (port && !port.isSupplyPort) {
    marketName = markets[port.marketId] ?? 'Unknown';
    regionName = regions[port.regionId] ?? 'Unknown';
    economy = port.economy;
    industry = port.industry;
  }

  // Pick a stable set of jobs based on port id to avoid randomness on re-render
  const portSeed = parseInt(state.portId ?? '0', 10);
  const job1 = jobTitles[portSeed % jobTitles.length];
  const job2 = jobTitles[(portSeed + 2) % jobTitles.length];

  let vendorMessage: VendorMessageBoxType = {
    body: `Welcome to the Sailor's Guild in ${portName}. How can we assist you?`,
  };

  const menu = (
    <BuildingMenu
      options={guildOptions.map((s) => ({
        label: s,
        value: s,
      }))}
      onSelect={(s) => selectOption(s)}
      onCancel={back}
      hidden={option !== null || step === -1}
    />
  );

  if (option === 'Job Assignment') {
    if (step === 0) {
      vendorMessage = {
        body: `Current jobs available in ${portName}:\n\n1. ${job1}\n\n2. ${job2}\n\nVisit us again after your next voyage for new assignments.`,
        acknowledge: back,
      };
    }
  }

  if (option === 'Country Info') {
    vendorMessage = {
      body: `${portName}\nRegion: ${regionName}\nMarket: ${marketName}\nEconomy: ${economy}\nIndustry: ${industry}`,
      acknowledge: back,
    };
  }

  if (step === -1) {
    vendorMessage = {
      body: 'May your travels be swift and profitable. Fair winds!',
      acknowledge: back,
    };
  }

  return (
    <BuildingWrapper
      buildingId="7"
      vendorMessageBox={vendorMessage}
      menu={menu}
    />
  );
}
