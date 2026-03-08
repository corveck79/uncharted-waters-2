import React, { ReactNode, useState, useRef } from 'react';

import useBuilding from './hooks/useBuilding';
import { VendorMessageBoxType } from '../quest/getMessageBoxes';
import BuildingMenu from '../common/BuildingMenu';
import BuildingWrapper from './BuildingWrapper';
import InputNumber from '../common/InputNumber';
import { buyGoods, sellGoods } from '../../state/actionsPort';
import {
  getGold,
  getCargoCapacityLeft,
  getCurrentMarketId,
  getPlayerGoods,
} from '../../state/selectors';
import { getPlayerFleet } from '../../state/selectorsFleet';
import {
  GoodsId,
  goodsData,
  getGoodsAvailableInMarket,
  getBuyPrice,
  getSellPrice,
} from '../../data/goodsData';

const marketOptions = ['Buy Goods', 'Sell Goods', 'Invest', 'Market Rate'] as const;
type MarketOptions = typeof marketOptions[number];

const marketDisabledOptions: MarketOptions[] = ['Invest'];

export default function Market() {
  const { selectOption, next, back, reset, state } =
    useBuilding<MarketOptions>(true);

  const [selectedGoodsId, setSelectedGoodsId] = useState<GoodsId>();
  const tradeQty = useRef(0);

  const { option, step } = state;
  const marketId = getCurrentMarketId();

  let vendorMessage: VendorMessageBoxType = {
    body: 'Welcome to the market. What can I do for you?',
  };

  const menu = (
    <BuildingMenu
      options={marketOptions.map((s) => ({
        label: s,
        value: s,
        disabled: marketDisabledOptions.includes(s),
      }))}
      onSelect={(s) => selectOption(s)}
      onCancel={back}
      hidden={option !== null || step === -1}
    />
  );

  let menu2: ReactNode;
  let children: ReactNode;

  if (option === 'Buy Goods') {
    const fleet = getPlayerFleet();

    if (!fleet.length) {
      vendorMessage = {
        body: "You need a ship before you can buy goods.",
        acknowledge: back,
      };
    } else {
      const capacityLeft = getCargoCapacityLeft();

      if (!capacityLeft) {
        vendorMessage = {
          body: "Your cargo holds are full. You can't buy any more goods.",
          acknowledge: back,
        };
      } else {
        const availableGoods = getGoodsAvailableInMarket(marketId);

        vendorMessage = { body: 'What goods are you looking to buy?' };

        menu2 = (
          <BuildingMenu
            title="Goods"
            options={availableGoods.map((id) => ({
              label: `${goodsData[id].name} (${getBuyPrice(id, marketId)} gold)`,
              value: id,
            }))}
            onSelect={(id) => {
              setSelectedGoodsId(id);
              next();
            }}
            onCancel={back}
            level2
            hidden={step !== 0}
          />
        );

        if (selectedGoodsId && step === 1) {
          const price = getBuyPrice(selectedGoodsId, marketId);
          const maxQty = Math.min(
            Math.floor(getGold() / price),
            capacityLeft,
          );

          if (!maxQty) {
            vendorMessage = {
              body: "You can't afford any of that.",
              acknowledge: () => {
                setSelectedGoodsId(undefined);
                back();
              },
            };
          } else {
            vendorMessage = {
              body: `${goodsData[selectedGoodsId].name} costs ${price} gold per unit. How many? (max ${maxQty})`,
            };

            children = (
              <InputNumber
                limit={maxQty}
                onComplete={(qty) => {
                  tradeQty.current = qty;
                  next();
                }}
                onCancel={() => {
                  setSelectedGoodsId(undefined);
                  back();
                }}
              />
            );
          }
        }

        if (selectedGoodsId && step === 2) {
          const price = getBuyPrice(selectedGoodsId, marketId);
          vendorMessage = {
            body: `That'll be ${tradeQty.current * price} gold for ${tradeQty.current} units of ${goodsData[selectedGoodsId].name}. Deal?`,
            confirm: {
              yes: () => {
                buyGoods(selectedGoodsId, tradeQty.current, price);
                setSelectedGoodsId(undefined);
                back(2);
              },
              no: () => {
                setSelectedGoodsId(undefined);
                back(2);
              },
            },
          };
        }
      }
    }
  }

  if (option === 'Sell Goods') {
    const playerGoods = getPlayerGoods();

    if (!playerGoods.length) {
      vendorMessage = {
        body: "You don't have any goods to sell.",
        acknowledge: back,
      };
    } else {
      vendorMessage = { body: 'What goods would you like to sell?' };

      menu2 = (
        <BuildingMenu
          title="Your Goods"
          options={playerGoods.map(({ id, quantity }) => ({
            label: `${goodsData[id].name} x${quantity} (${getSellPrice(id, marketId)} gold/unit)`,
            value: id,
          }))}
          onSelect={(id) => {
            setSelectedGoodsId(id);
            next();
          }}
          onCancel={back}
          level2
          hidden={step !== 0}
        />
      );

      if (selectedGoodsId && step === 1) {
        const ownedGood = getPlayerGoods().find((g) => g.id === selectedGoodsId);
        const maxQty = ownedGood?.quantity || 0;
        const price = getSellPrice(selectedGoodsId, marketId);

        vendorMessage = {
          body: `You have ${maxQty} units. I'll pay ${price} gold per unit. How many?`,
        };

        children = (
          <InputNumber
            limit={maxQty}
            onComplete={(qty) => {
              tradeQty.current = qty;
              next();
            }}
            onCancel={() => {
              setSelectedGoodsId(undefined);
              back();
            }}
          />
        );
      }

      if (selectedGoodsId && step === 2) {
        const price = getSellPrice(selectedGoodsId, marketId);
        vendorMessage = {
          body: `I'll pay you ${tradeQty.current * price} gold for ${tradeQty.current} units of ${goodsData[selectedGoodsId].name}. Deal?`,
          confirm: {
            yes: () => {
              sellGoods(selectedGoodsId, tradeQty.current, price);
              setSelectedGoodsId(undefined);
              back(2);
            },
            no: () => {
              setSelectedGoodsId(undefined);
              back(2);
            },
          },
        };
      }
    }
  }

  if (option === 'Market Rate') {
    const availableGoods = getGoodsAvailableInMarket(marketId);
    const lines = availableGoods
      .map(
        (id) =>
          `${goodsData[id].name}: Buy ${getBuyPrice(id, marketId)} / Sell ${getSellPrice(id, marketId)}`,
      )
      .join('\n');

    vendorMessage = {
      body: `Current prices:\n${lines}`,
      acknowledge: reset,
    };
  }

  if (step === -1) {
    vendorMessage = {
      body: 'Come back soon, sailor!',
      acknowledge: back,
    };
  }

  return (
    <BuildingWrapper
      buildingId="1"
      vendorMessageBox={vendorMessage}
      menu={menu}
      menu2={menu2}
    >
      {children}
    </BuildingWrapper>
  );
}
