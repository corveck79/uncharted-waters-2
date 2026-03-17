import React, { useState } from 'react';

import useBuilding from './hooks/useBuilding';
import { VendorMessageBoxType } from '../quest/getMessageBoxes';
import BuildingMenu from '../common/BuildingMenu';
import BuildingWrapper from './BuildingWrapper';
import { getPortData } from '../../game/port/portUtils';
import { markets } from '../../data/portExtraData';
import state from '../../state/state';
import { discoveryData, allDiscoveryIds, type Discovery } from '../../data/discoveryData';
import { regularPorts } from '../../data/portData';
import { acceptGuildQuest, claimGuildQuestReward } from '../../state/actionsPort';

const REWARD_PER_FAME = 50;

// Market to broad discovery region mapping
const MARKET_DISCOVERY_REGIONS: Record<string, string[]> = {
  '1': ['Europe'],
  '2': ['Europe'],
  '3': ['Europe', 'Africa'],
  '4': ['Africa'],
  '5': ['Asia'],
  '6': ['Africa'],
  '7': ['Americas'],
  '8': ['Americas'],
  '9': ['Africa'],
  '10': ['Asia'],
  '11': ['Asia'],
  '12': ['Asia', 'Ocean'],
  '13': ['Asia'],
};

function getDirectionHint(px: number, py: number, dx: number, dy: number): string {
  const ddx = dx - px;
  const ddy = dy - py;
  const dist = Math.sqrt(ddx * ddx + ddy * ddy);
  const distStr = dist < 200 ? 'nearby' : dist < 450 ? 'a voyage away' : 'far distant';

  const angle = (Math.atan2(ddy, ddx) * 180) / Math.PI;
  let dir: string;
  if (angle >= -22.5 && angle < 22.5) dir = 'east';
  else if (angle >= 22.5 && angle < 67.5) dir = 'southeast';
  else if (angle >= 67.5 && angle < 112.5) dir = 'south';
  else if (angle >= 112.5 && angle < 157.5) dir = 'southwest';
  else if (angle >= 157.5 || angle < -157.5) dir = 'west';
  else if (angle >= -157.5 && angle < -112.5) dir = 'northwest';
  else if (angle >= -112.5 && angle < -67.5) dir = 'north';
  else dir = 'northeast';

  return `${distStr}, to the ${dir}`;
}

function getAvailableQuests(portId: string): Discovery[] {
  const portIdx = parseInt(portId, 10) - 1;
  const portPos = regularPorts[portIdx]?.position ?? { x: 900, y: 450 };
  const found = state.discoveries ?? [];

  const unfound = allDiscoveryIds
    .map((id) => discoveryData[id])
    .filter((d): d is Discovery => !!d && !found.includes(d.id));

  // Sort by distance from port, take closest 5, return 3
  unfound.sort((a, b) => {
    const da = Math.hypot(a.worldX - portPos.x, a.worldY - portPos.y);
    const db = Math.hypot(b.worldX - portPos.x, b.worldY - portPos.y);
    return da - db;
  });

  return unfound.slice(0, 3);
}

type GuildOption = 'Job Assignment' | 'Quest Report' | 'Country Info';

export default function Guild() {
  const { selectOption, back, next, state: buildingState } =
    useBuilding<GuildOption>(true);

  const { option, step } = buildingState;
  const [selectedDiscovery, setSelectedDiscovery] = useState<Discovery | null>(null);

  const portId = state.portId ?? '1';
  const port = getPortData(portId);
  const portName = port?.name ?? 'this port';
  const portPos = regularPorts[parseInt(portId, 10) - 1]?.position ?? { x: 900, y: 450 };

  let marketName = 'Unknown';
  let regionName = 'Unknown';
  let economy = 0;
  let industry = 0;

  if (port && !port.isSupplyPort) {
    marketName = markets[port.marketId] ?? 'Unknown';
    economy = port.economy;
    industry = port.industry;
  }

  // Active guild quest state
  const activeQuest = state.guildQuest;
  const questDiscovery = activeQuest ? discoveryData[activeQuest.discoveryId] : null;
  const questCompleted = activeQuest
    ? (state.discoveries ?? []).includes(activeQuest.discoveryId)
    : false;

  // Available jobs (undiscovered items near this port)
  const availableQuests = getAvailableQuests(portId);

  // Build dynamic main menu
  const menuOptions: { label: string; value: GuildOption }[] = [];
  if (activeQuest) {
    menuOptions.push({ label: 'Quest Report', value: 'Quest Report' });
  }
  menuOptions.push({ label: 'Job Assignment', value: 'Job Assignment' });
  menuOptions.push({ label: 'Country Info', value: 'Country Info' });

  // ── Vendor message & sub-menus ──────────────────────────────────────────

  let vendorMessage: VendorMessageBoxType = {
    body: `Welcome to the Adventurer's Guild in ${portName}. We have exploration contracts available. How can we assist you?`,
  };

  // ── Quest Report ──────────────────────────────────────────────────────────
  if (option === 'Quest Report' && questDiscovery) {
    if (questCompleted) {
      vendorMessage = {
        body: `Extraordinary! You've found the ${questDiscovery.name}! Your discovery has brought great honour to the Guild.\n\nAs promised, here is your reward of ${activeQuest!.rewardGold.toLocaleString()} gold coins.`,
        acknowledge: () => {
          claimGuildQuestReward();
          back();
        },
      };
    } else {
      const hint = getDirectionHint(
        portPos.x,
        portPos.y,
        questDiscovery.worldX,
        questDiscovery.worldY,
      );
      vendorMessage = {
        body: `Your current assignment: find the ${questDiscovery.name}.\n\nLast reported sighting: ${questDiscovery.region}, ${hint}.\n\nReward upon return: ${activeQuest!.rewardGold.toLocaleString()} gold.\n\nFair winds, explorer.`,
        acknowledge: back,
      };
    }
  }

  // ── Job Assignment ────────────────────────────────────────────────────────
  let jobMenu: React.ReactNode = null;

  if (option === 'Job Assignment') {
    if (step === 0) {
      // Show selection list
      if (availableQuests.length === 0) {
        vendorMessage = {
          body: 'We have no active contracts at this time. All known discoveries in the region have already been documented. Return after your next voyage.',
          acknowledge: back,
        };
      } else {
        vendorMessage = {
          body: 'Select a contract to view details:',
        };
        jobMenu = (
          <BuildingMenu
            options={availableQuests.map((d) => ({
              label: `${d.name} (${d.region})`,
              value: d.id,
            }))}
            onSelect={(id) => {
              const disc = discoveryData[id];
              if (disc) {
                setSelectedDiscovery(disc);
                next();
              }
            }}
            onCancel={back}
            hidden={false}
          />
        );
      }
    }

    if (step === 1 && selectedDiscovery) {
      const reward = selectedDiscovery.adventureFame * REWARD_PER_FAME;
      const hint = getDirectionHint(
        portPos.x,
        portPos.y,
        selectedDiscovery.worldX,
        selectedDiscovery.worldY,
      );
      vendorMessage = {
        body: `Assignment: ${selectedDiscovery.name}\n\nCategory: ${selectedDiscovery.category}\nRegion: ${selectedDiscovery.region}\nLocation: ${hint}\n\n"${selectedDiscovery.description}"\n\nReward: ${reward.toLocaleString()} gold upon your return.\n\nAccept this contract?`,
      };
      jobMenu = (
        <BuildingMenu
          options={[
            { label: 'Accept', value: 'accept' },
            { label: 'Decline', value: 'decline' },
          ]}
          onSelect={(choice) => {
            if (choice === 'accept') {
              acceptGuildQuest(selectedDiscovery.id, reward);
              setSelectedDiscovery(null);
              back(2);
            } else {
              setSelectedDiscovery(null);
              back();
            }
          }}
          onCancel={() => {
            setSelectedDiscovery(null);
            back();
          }}
          hidden={false}
        />
      );
    }
  }

  // ── Country Info ──────────────────────────────────────────────────────────
  if (option === 'Country Info') {
    vendorMessage = {
      body: `${portName}\nMarket: ${marketName}\nEconomy: ${economy}\nIndustry: ${industry}`,
      acknowledge: back,
    };
  }

  // ── Exit message ──────────────────────────────────────────────────────────
  if (step === -1) {
    vendorMessage = {
      body: 'May your discoveries bring fame and fortune. Fair winds!',
      acknowledge: back,
    };
  }

  const mainMenu = (
    <BuildingMenu
      options={menuOptions}
      onSelect={(s) => selectOption(s)}
      onCancel={back}
      hidden={option !== null || step === -1}
    />
  );

  return (
    <BuildingWrapper
      buildingId="7"
      vendorMessageBox={vendorMessage}
      menu={jobMenu ?? mainMenu}
    />
  );
}
