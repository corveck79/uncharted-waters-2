import React, { ReactNode, useState, useRef } from 'react';

import BuildingMenu from '../../common/BuildingMenu';
import {
  buyUsedShip,
  buyNewShip,
  getAvailableSailorId,
  SELL_SHIP_MODIFIER,
  sellShipNumber,
  remodelShip,
  renameShip,
  getRemodelCost,
  getEffectiveCargo,
  investInShipyard,
  INVEST_COST_PER_POINT,
  setFigurehead,
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
  getEffectiveIndustry,
} from '../../../state/selectors';
import { shipyardsToShips } from '../../../data/portShipyardData';
import { getPortData } from '../../../game/port/portUtils';

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
  const [remodelSubOption, setRemodelSubOption] = useState<'Figurehead' | 'Guns' | 'Load Capacity' | 'Rename'>();
  const [remodelBunks, setRemodelBunks] = useState<number>();
  const [remodelGuns, setRemodelGuns] = useState<number>();
  const [selectedFigurehead, setSelectedFigurehead] = useState<string>();
  const [selectedGunType, setSelectedGunType] = useState<string>();

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

    const resetRemodel = (steps = 0) => {
      setRemodelShipNumber(undefined);
      setRemodelSubOption(undefined);
      setRemodelBunks(undefined);
      setRemodelGuns(undefined);
      setSelectedFigurehead(undefined);
      setSelectedGunType(undefined);
      back(steps);
    };

    const figureheadTypes = [
      'Sea Horse', 'Commodore', 'Unicorn', 'Lion', 'Giant Eagle',
      'Hero', 'Neptune', 'Dragon', 'Angel', 'Goddess',
    ];
    const figureheadCosts: Record<string, number> = {
      'Sea Horse':   500,
      'Commodore':   1000,
      'Unicorn':     2000,
      'Lion':        3500,
      'Giant Eagle': 6000,
      'Hero':        10000,
      'Neptune':     18000,
      'Dragon':      30000,
      'Angel':       50000,
      'Goddess':     80000,
    };

    const gunTypes = ['Cannon', 'Demi-cannon', 'Canon Pedrero', 'Culverin', 'Demi-culverin', 'Saker', 'Carronade'];
    const gunCostsPerSlot: Record<string, number> = {
      'Cannon':        300,
      'Demi-cannon':   500,
      'Canon Pedrero': 400,
      'Culverin':      800,
      'Demi-culverin': 650,
      'Saker':         200,
      'Carronade':     1000,
    };

    // step 0: select which ship
    if (step === 0) {
      vendorMessage = { body: 'Which ship would ye like to remodel?' };
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

    // step 1: sub-menu — Figurehead / Guns / Load Capacity / Rename
    if (step === 1 && remodelShipNumber !== undefined) {
      vendorMessage = { body: 'What would ye like to change?' };
      menu2 = (
        <BuildingMenu
          title="Remodel"
          options={(['Figurehead', 'Guns', 'Load Capacity', 'Rename'] as const).map((s) => ({
            label: s,
            value: s,
          }))}
          onSelect={(sub) => {
            setRemodelSubOption(sub);
            next();
          }}
          onCancel={() => resetRemodel(1)}
          level2
          hidden={step !== 1}
        />
      );
    }

    // step 2+: branch by sub-option
    if (step >= 2 && remodelShipNumber !== undefined && remodelSubOption) {
      const ship = fleet[remodelShipNumber];
      const data = shipData[ship.id];

      if (remodelSubOption === 'Figurehead') {
        if (step === 2) {
          vendorMessage = { body: 'What type are ye interested in?' };
          children = <ShipyardShipBox shipId={ship.id} customShipName={ship.name} />;
          menu2 = (
            <BuildingMenu
              title="Figurehead"
              options={figureheadTypes.map((f) => ({ label: f, value: f }))}
              onSelect={(f) => { setSelectedFigurehead(f); next(); }}
              onCancel={() => resetRemodel(2)}
              level2
              hidden={step !== 2}
            />
          );
        }
        if (step === 3 && selectedFigurehead) {
          const figureheadCost = figureheadCosts[selectedFigurehead] ?? 500;
          children = <ShipyardShipBox shipId={ship.id} customShipName={ship.name} />;
          if (!canAfford(figureheadCost)) {
            vendorMessage = { body: "You don't have enough gold for that.", acknowledge: () => resetRemodel(3) };
          } else {
            vendorMessage = {
              body: `A ${selectedFigurehead} figurehead will cost ${figureheadCost} gold. Is this OK?`,
              confirm: {
                yes: () => { setFigurehead(remodelShipNumber!, selectedFigurehead, figureheadCost); next(); },
                no: () => resetRemodel(3),
              },
            };
          }
        }
        if (step === 4) {
          vendorMessage = { body: 'The new figurehead has been fitted!', acknowledge: () => resetRemodel(4) };
        }
      }

      if (remodelSubOption === 'Guns') {
        if (step === 2) {
          vendorMessage = { body: 'What type are ye interested in?' };
          children = <ShipyardShipBox shipId={ship.id} customShipName={ship.name} />;
          menu2 = (
            <BuildingMenu
              title="Guns"
              options={gunTypes.map((g) => ({ label: g, value: g }))}
              onSelect={(g) => { setSelectedGunType(g); next(); }}
              onCancel={() => resetRemodel(2)}
              level2
              hidden={step !== 2}
            />
          );
        }
        if (step === 3 && selectedGunType) {
          const gunCostPerSlot = gunCostsPerSlot[selectedGunType] ?? 300;
          const gunCost = data.maximumGuns * gunCostPerSlot;
          children = <ShipyardShipBox shipId={ship.id} customShipName={ship.name} />;
          if (!canAfford(gunCost)) {
            vendorMessage = { body: "You don't have enough gold for that.", acknowledge: () => resetRemodel(3) };
          } else {
            vendorMessage = {
              body: `Installing ${selectedGunType}s will cost ${gunCost} gold. Is this OK?`,
              confirm: {
                yes: () => next(),
                no: () => resetRemodel(3),
              },
            };
          }
        }
        if (step === 4) {
          vendorMessage = { body: 'The new guns have been installed!', acknowledge: () => resetRemodel(4) };
        }
      }

      if (remodelSubOption === 'Load Capacity') {
        const currentBunks = ship.configBunks ?? data.minimumCrew;
        const currentGuns = ship.configGuns ?? data.usedGuns;

        if (step === 2) {
          vendorMessage = {
            body: `How many bunks for the crew? (${data.minimumCrew}–${data.maximumCrew})`,
          };
          children = (
            <>
              <ShipyardShipBox shipId={ship.id} customShipName={ship.name} />
              <InputNumber
                min={data.minimumCrew}
                limit={data.maximumCrew}
                defaultValue={currentBunks}
                onComplete={(val) => { setRemodelBunks(val); next(); }}
                onCancel={() => resetRemodel(2)}
              />
            </>
          );
        }

        if (step === 3 && remodelBunks !== undefined) {
          vendorMessage = {
            body: `Make space for how many guns? (0–${data.maximumGuns})`,
          };
          children = (
            <>
              <ShipyardShipBox shipId={ship.id} customShipName={ship.name} />
              <InputNumber
                limit={data.maximumGuns}
                defaultValue={currentGuns}
                onComplete={(val) => { setRemodelGuns(val); next(); }}
                onCancel={() => { setRemodelBunks(undefined); back(); }}
              />
            </>
          );
        }

        if (step === 4 && remodelBunks !== undefined && remodelGuns !== undefined) {
          const cost = getRemodelCost(ship.id, currentBunks, currentGuns, 'teak', remodelBunks, remodelGuns);
          const newCargo = getEffectiveCargo(ship.id, remodelBunks, remodelGuns);
          children = <ShipyardShipBox shipId={ship.id} customShipName={ship.name} />;

          if (!canAfford(cost)) {
            vendorMessage = {
              body: "You don't have enough gold for that remodel.",
              acknowledge: () => resetRemodel(4),
            };
          } else {
            vendorMessage = {
              body: `It will cost ye ${cost} gold pieces to change the cargo capacity to ${newCargo}. Is this OK?`,
              confirm: {
                yes: () => { remodelShip(remodelShipNumber, 'teak', remodelBunks, remodelGuns); next(); },
                no: () => resetRemodel(4),
              },
            };
          }
        }

        if (step === 5) {
          vendorMessage = { body: 'Then give it a new name.' };
          children = (
            <ShipyardShipInputName
              onSubmit={(newName) => { renameShip(remodelShipNumber, newName); resetRemodel(5); }}
              onCancel={() => resetRemodel(5)}
            />
          );
        }
      }

      if (remodelSubOption === 'Rename') {
        if (step === 2) {
          vendorMessage = { body: 'What shall we call her?' };
          children = (
            <ShipyardShipInputName
              onSubmit={(newName) => { renameShip(remodelShipNumber, newName); resetRemodel(2); }}
              onCancel={() => resetRemodel(2)}
            />
          );
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
      const currentIndustry = getEffectiveIndustry(portId);
      const portEntry = getPortData(portId);
      const industryId = !portEntry.isSupplyPort ? portEntry.industryId : null;
      const allShipsHere = industryId ? (shipyardsToShips[industryId] || []) : [];
      const nextShip = allShipsHere.find((s) => s.industryRequirement > currentIndustry);
      const nextUnlockMsg = nextShip
        ? ` Next unlock: ${shipData[nextShip.shipId].name} — needs ${nextShip.industryRequirement - currentIndustry} more industry (${(nextShip.industryRequirement - currentIndustry) * INVEST_COST_PER_POINT} gold).`
        : ' You have unlocked all available ships at this port.';

      if (step === 0) {
        vendorMessage = {
          body: `Current industry boost: ${investment.industry}.${nextUnlockMsg} Each ${INVEST_COST_PER_POINT} gold = +1 industry. How much will ye invest? (max ${gold})`,
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
