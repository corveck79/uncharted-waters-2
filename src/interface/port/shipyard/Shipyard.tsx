import React, { ReactNode, useState, useRef } from 'react';

import BuildingMenu from '../../common/BuildingMenu';
import {
  buyUsedShip,
  buyNewShip,
  getAvailableSailorId,
  SELL_SHIP_MODIFIER,
  sellShipNumber,
  remodelShip,
  getRemodelCost,
  investInShipyard,
  INVEST_COST_PER_POINT,
} from '../../../state/actionsPort';
import ShipyardShipBox from './ShipyardShipBox';
import { shipData } from '../../../data/shipData';
import {
  getPlayerFleet,
  getPlayerFleetShip,
} from '../../../state/selectorsFleet';
import BuildingWrapper from '../BuildingWrapper';
import useBuilding from '../hooks/useBuilding';
import { VendorMessageBoxType } from '../../quest/getMessageBoxes';
import ShipyardShipInputName from './ShipyardShipInputName';
import InputNumber from '../../common/InputNumber';
import {
  canAfford,
  getUsedShips,
  getNewShipsAvailable,
  getGold,
  getCurrentPortId,
  getPortInvestment,
} from '../../../state/selectors';

const shipyardOptions = [
  'New Ship',
  'Used Ship',
  'Repair',
  'Sell',
  'Remodel',
  'Invest',
] as const;
type ShipyardOptions = typeof shipyardOptions[number];

const shipyardDisabledOptions: ShipyardOptions[] = [];

export default function Shipyard() {
  const { selectOption, back, next, state } = useBuilding<ShipyardOptions>();

  const [usedShipId, setUsedShipId] = useState<string>();
  const [newShipId, setNewShipId] = useState<string>();

  const [selectedShipNumberToSell, setSelectedShipNumberToSell] =
    useState<number>();

  const investQty = useRef(0);

  const [remodelShipNumber, setRemodelShipNumber] = useState<number>();
  const [remodelTargetId, setRemodelTargetId] = useState<string>();

  const { option, step } = state;

  let vendorMessage: VendorMessageBoxType = {
    body: 'What brings you to this shipyard?',
  };

  const menu = (
    <BuildingMenu
      options={shipyardOptions.map((s) => ({
        label: s,
        value: s,
        disabled: shipyardDisabledOptions.includes(s),
      }))}
      onSelect={(s) => selectOption(s)}
      onCancel={back}
      hidden={option !== null}
    />
  );

  let menu2: ReactNode;

  let children: ReactNode;

  if (option === 'New Ship') {
    const newShips = getNewShipsAvailable();

    if (!newShips.length) {
      vendorMessage = {
        body: "Sorry, we don\u2019t have any new ships available at this port.",
        acknowledge: back,
      };
    } else {
      menu2 = (
        <BuildingMenu
          title="Ship Model"
          options={newShips.map(({ shipId }) => ({
            label: `${shipData[shipId].name} (${shipData[shipId].basePrice} gold)`,
            value: shipId,
          }))}
          onSelect={(shipId) => {
            setNewShipId(shipId);
            next();
          }}
          onCancel={back}
          level2
          hidden={step !== 0}
        />
      );
    }

    if (newShipId) {
      children = <ShipyardShipBox shipId={newShipId} />;

      if (step === 1) {
        vendorMessage = {
          body: shipData[newShipId].description,
          acknowledge: next,
        };
      }

      if (step === 2) {
        vendorMessage = {
          body: `A brand new ${shipData[newShipId].name} will cost you ${shipData[newShipId].basePrice} gold. Interested?`,
          confirm: {
            yes: next,
            no: () => {
              setNewShipId(undefined);
              back(2);
            },
          },
        };
      }

      if (step === 3) {
        if (!canAfford(shipData[newShipId].basePrice)) {
          vendorMessage = {
            body: 'You don\u2019t have enough gold for that ship.',
            acknowledge: () => {
              setNewShipId(undefined);
              back(3);
            },
          };
        } else if (!getAvailableSailorId()) {
          vendorMessage = {
            body: 'You don\u2019t have a sailor available to captain this ship.',
            acknowledge: () => {
              setNewShipId(undefined);
              back(3);
            },
          };
        } else {
          vendorMessage = {
            body: 'Excellent choice! What will you name her?',
          };

          children = (
            <ShipyardShipInputName
              onSubmit={(name) => {
                buyNewShip(newShipId, name);
                setNewShipId(undefined);
                back(3);
              }}
              onCancel={() => {
                setNewShipId(undefined);
                back(3);
              }}
            />
          );
        }
      }
    }
  }

  if (option === 'Used Ship') {
    const usedShips = getUsedShips();

    menu2 = (
      <BuildingMenu
        title="Ship Model"
        options={Object.entries(usedShips).map(([id, shipId]) => ({
          label: shipData[shipId].name,
          value: id,
        }))}
        onSelect={(shipId) => {
          setUsedShipId(shipId);
          next();
        }}
        onCancel={back}
        level2
        hidden={step !== 0}
      />
    );

    if (usedShipId) {
      children = <ShipyardShipBox shipId={usedShips[usedShipId]} />;

      if (step === 1) {
        vendorMessage = {
          body: shipData[usedShips[usedShipId]].description,
          acknowledge: next,
        };
      }

      if (step === 2) {
        vendorMessage = {
          body: `I’d sell this ship for ${
            shipData[usedShips[usedShipId]].basePrice
          } gold pieces. What do ye say?`,
          confirm: {
            yes: next,
            no: () => {
              setUsedShipId(undefined);
              back(2);
            },
          },
        };
      }

      if (step === 3) {
        if (!canAfford(shipData[usedShips[usedShipId]].basePrice)) {
          vendorMessage = {
            body: 'I’m afraid you don’t have enough gold.',
            acknowledge: () => {
              setUsedShipId(undefined);
              back(3);
            },
          };
        } else if (!getAvailableSailorId()) {
          // the original game offers you to swap ship
          vendorMessage = {
            body: 'You don’t have a sailor available to captain this ship.',
            acknowledge: () => {
              setUsedShipId(undefined);
              back(3);
            },
          };
        } else {
          vendorMessage = {
            body: 'All right, it’s yers. Time to name yer ship.',
          };

          children = (
            <ShipyardShipInputName
              onSubmit={(usedShipName) => {
                buyUsedShip(usedShipId, usedShipName);
                setUsedShipId(undefined);
                back(3);
              }}
              onCancel={() => {
                setUsedShipId(undefined);
                back(3);
              }}
            />
          );
        }
      }
    }
  }

  if (option === 'Repair') {
    vendorMessage = {
      body: 'Your fleet’s already in tiptop shape, matey!',
      acknowledge: back,
    };
  }

  if (option === 'Sell') {
    if (getPlayerFleet().length === 1) {
      if (step === 0) {
        vendorMessage = {
          body: 'We only have the flag ship.',
          acknowledge: back,
        };
      }
    } else {
      menu2 = (
        <BuildingMenu
          title="Your Ships"
          options={getPlayerFleet().map((ship, i) => ({
            label: ship.name,
            value: i,
          }))}
          onSelect={(value) => {
            setSelectedShipNumberToSell(value);
            next();
          }}
          onCancel={back}
          level2
          hidden={step !== 0}
        />
      );

      if (step === 0) {
        vendorMessage = {
          body: 'Which one is for sale?',
        };
      }

      if (step === 1 && selectedShipNumberToSell !== undefined) {
        /*
          TODO
            As you currently cannot modify ships and there are no hull types,
            we can just use the defaults for the ship model in question.
         */
        const ship = getPlayerFleetShip(selectedShipNumberToSell);

        vendorMessage = {
          body: `For this ship, I’ll give you ${
            shipData[ship.id].basePrice * SELL_SHIP_MODIFIER
          } gold pieces. OK?`,
          confirm: {
            yes: () => {
              sellShipNumber(selectedShipNumberToSell);
              setSelectedShipNumberToSell(undefined);
              back();
            },
            no: () => {
              setSelectedShipNumberToSell(undefined);
              back();
            },
          },
        };

        children = (
          <ShipyardShipBox shipId={ship.id} customShipName={ship.name} />
        );
      }
    }
  }

  if (option === 'Remodel') {
    const fleet = getPlayerFleet();
    const availableShips = getNewShipsAvailable();

    if (!availableShips.length) {
      vendorMessage = {
        body: "We don't have the equipment for remodeling here.",
        acknowledge: back,
      };
    } else if (fleet.length === 0) {
      vendorMessage = {
        body: "You don't have any ships to remodel.",
        acknowledge: back,
      };
    } else {
      if (step === 0) {
        vendorMessage = { body: 'Which ship would you like to remodel?' };
        menu2 = (
          <BuildingMenu
            title="Your Ships"
            options={fleet.map((ship, i) => ({
              label: ship.name,
              value: i,
            }))}
            onSelect={(value) => {
              setRemodelShipNumber(value);
              next();
            }}
            onCancel={back}
            level2
            hidden={step !== 0}
          />
        );
      }

      if (step === 1 && remodelShipNumber !== undefined) {
        const currentShip = fleet[remodelShipNumber];
        const targets = availableShips.filter(
          ({ shipId }) => shipId !== currentShip.id,
        );

        if (!targets.length) {
          vendorMessage = {
            body: "There's nothing better we can remodel this ship into.",
            acknowledge: () => {
              setRemodelShipNumber(undefined);
              back();
            },
          };
        } else {
          vendorMessage = { body: 'What would you like to remodel it into?' };
          menu2 = (
            <BuildingMenu
              title="Target Model"
              options={targets.map(({ shipId }) => ({
                label: `${shipData[shipId].name} (${getRemodelCost(shipId)} gold)`,
                value: shipId,
              }))}
              onSelect={(shipId) => {
                setRemodelTargetId(shipId);
                next();
              }}
              onCancel={() => {
                setRemodelShipNumber(undefined);
                back();
              }}
              level2
              hidden={step !== 1}
            />
          );
        }
      }

      if (step === 2 && remodelShipNumber !== undefined && remodelTargetId) {
        const cost = getRemodelCost(remodelTargetId);
        children = <ShipyardShipBox shipId={remodelTargetId} />;

        if (!canAfford(cost)) {
          vendorMessage = {
            body: "You don't have enough gold for that remodel.",
            acknowledge: () => {
              setRemodelShipNumber(undefined);
              setRemodelTargetId(undefined);
              back(2);
            },
          };
        } else {
          vendorMessage = {
            body: `Remodeling to a ${shipData[remodelTargetId].name} will cost ${cost} gold. Shall I proceed?`,
            confirm: {
              yes: () => {
                remodelShip(remodelShipNumber, remodelTargetId);
                setRemodelShipNumber(undefined);
                setRemodelTargetId(undefined);
                back(2);
              },
              no: () => {
                setRemodelShipNumber(undefined);
                setRemodelTargetId(undefined);
                back(2);
              },
            },
          };
        }
      }
    }
  }

  if (option === 'Invest') {
    const portId = getCurrentPortId();
    if (!portId) {
      vendorMessage = { body: 'No shipyard to invest in.', acknowledge: back };
    } else if (!getGold()) {
      vendorMessage = {
        body: "You don't have any gold to invest.",
        acknowledge: back,
      };
    } else {
      const gold = getGold();
      const investment = getPortInvestment(portId);

      if (step === 0) {
        vendorMessage = {
          body: `Current industry boost: ${investment.industry}. Each ${INVEST_COST_PER_POINT} gold invested boosts industry by 1, unlocking better ships. How much will you invest? (max ${gold})`,
        };

        children = (
          <InputNumber
            limit={gold}
            onComplete={(amount) => {
              investQty.current = amount;
              next();
            }}
            onCancel={back}
          />
        );
      }

      if (step === 1) {
        vendorMessage = {
          body: `Invest ${investQty.current} gold for +${Math.floor(investQty.current / INVEST_COST_PER_POINT)} industry boost?`,
          confirm: {
            yes: () => {
              investInShipyard(investQty.current);
              back(1);
            },
            no: () => back(1),
          },
        };
      }
    }
  }

  return (
    <BuildingWrapper
      buildingId="3"
      vendorMessageBox={vendorMessage}
      menu={menu}
      menu2={menu2}
    >
      {children}
    </BuildingWrapper>
  );
}
