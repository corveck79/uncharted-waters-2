import React, { ReactNode, useRef, useState } from 'react';
import useBuilding from './hooks/useBuilding';
import { VendorMessageBoxType } from '../quest/getMessageBoxes';
import BuildingMenu from '../common/BuildingMenu';
import BuildingWrapper from './BuildingWrapper';
import {
  getPlayerItems,
  getItemShopStock,
  getPlayerItem,
  getGold,
  canBuyItem,
  getTimeOfDay,
  getCurrentPortId,
} from '../../state/selectors';
import { getPortData } from '../../game/port/portUtils';
import { itemData, ItemId, isSellable } from '../../data/itemData';
import ItemShopItemBox from '../ItemShopItemBox';
import {
  buyItem,
  ITEM_SHOP_SELL_MULTIPLIER,
  sellItem,
} from '../../state/actionsPort';

const itemShopOptions = ['Buy', 'Sell'] as const;
type ItemShopOptions = typeof itemShopOptions[number];

type HaggleOutcome = 'success' | 'fail' | 'noGold' | undefined;

export default function ItemShop() {
  const { selectOption, next, back, reset, state } =
    useBuilding<ItemShopOptions>();

  const hasBought = useRef(false);
  const [selectedItemId, setSelectedItemId] = useState<ItemId>();

  const hasSold = useRef(false);
  const [selectedItemI, setSelectedItemI] = useState<number>();

  const [haggleOutcome, setHaggleOutcome] = useState<HaggleOutcome>();
  const haggledPrice = useRef(0);

  const { option, step } = state;

  const portId = getCurrentPortId();
  const portEntry = portId ? getPortData(portId) : null;
  const hasSecretItem = !!(portEntry && !portEntry.isSupplyPort && portEntry.itemShop?.secret);
  const timeOfDay = getTimeOfDay();
  const secretShopOpen = timeOfDay >= 120 && timeOfDay < 180;
  const secretHint =
    hasSecretItem && !secretShopOpen
      ? " ...though some say I keep rarer goods for those who visit in the dead of night."
      : '';

  let vendorMessage: VendorMessageBoxType = {
    body: `May I help you?${secretHint}`,
  };

  const menu: ReactNode = (
    <BuildingMenu
      options={itemShopOptions.map((s) => ({
        label: s,
        value: s,
      }))}
      onSelect={(s) => selectOption(s)}
      onCancel={back}
      hidden={option !== null || step === -1}
    />
  );

  let menu2: ReactNode;

  let children: ReactNode;

  if (option === 'Buy') {
    if (!getGold()) {
      vendorMessage = {
        body: 'It seems you have no gold.',
        acknowledge: back,
      };
    } else {
      vendorMessage = {
        body: !hasBought.current
          ? 'I\u2019m sure you\u2019ll find something you like.'
          : 'Are you interested in anything else?',
      };

      const stock = getItemShopStock();

      menu2 = (
        <BuildingMenu
          title="Item"
          options={stock.map((item) => ({
            label: item.name,
            value: item.id,
            disabled: !canBuyItem(item.id),
          }))}
          onSelect={(itemId) => {
            setSelectedItemId(itemId);
            next();
          }}
          onCancel={back}
          level2
          hidden={step !== 0}
        />
      );
    }

    if (selectedItemId) {
      const item = itemData[selectedItemId];
      children = <ItemShopItemBox item={item} />;

      if (step === 1) {
        vendorMessage = {
          body: `The ${item.name} will cost you ${item.price} gold.`,
        };

        menu2 = (
          <BuildingMenu
            title="Options"
            options={[
              { label: 'Buy', value: 'buy' },
              { label: 'Haggle', value: 'haggle' },
              { label: 'Cancel', value: 'cancel' },
            ]}
            onSelect={(action) => {
              if (action === 'buy') {
                if (!buyItem(selectedItemId)) {
                  setHaggleOutcome('noGold');
                  next();
                  return;
                }
                hasBought.current = true;
                setSelectedItemId(undefined);
                if (getGold()) back();
                else reset();
              } else if (action === 'haggle') {
                const success = Math.random() < 0.5;
                if (success) {
                  haggledPrice.current = Math.floor(item.price * 0.8);
                  setHaggleOutcome('success');
                } else {
                  setHaggleOutcome('fail');
                }
                next();
              } else {
                setSelectedItemId(undefined);
                back();
              }
            }}
            onCancel={() => {
              setSelectedItemId(undefined);
              back();
            }}
            level2
          />
        );
      }

      if (step === 2) {
        if (haggleOutcome === 'noGold') {
          vendorMessage = {
            body: "I\u2019m afraid you don\u2019t have enough gold.",
            acknowledge: () => {
              setHaggleOutcome(undefined);
              back(2);
            },
          };
        } else if (haggleOutcome === 'success') {
          vendorMessage = {
            body: `How about ${haggledPrice.current} gold? That\u2019s as low as I can go.`,
            confirm: {
              yes: () => {
                buyItem(selectedItemId, false, haggledPrice.current);
                hasBought.current = true;
                setSelectedItemId(undefined);
                setHaggleOutcome(undefined);
                if (getGold()) back(2);
                else reset();
              },
              no: () => {
                setHaggleOutcome(undefined);
                back();
              },
            },
          };
        } else if (haggleOutcome === 'fail') {
          vendorMessage = {
            body: `${item.price} gold is the best I can offer. Take it or leave it.`,
            acknowledge: () => {
              setHaggleOutcome(undefined);
              back();
            },
          };
        }
      }
    }
  }

  if (option === 'Sell') {
    const allItems = getPlayerItems();
    const sellableItems = allItems
      .map((item, originalIndex) => ({ ...item, originalIndex }))
      .filter((item) => isSellable(item.id));

    if (!sellableItems.length) {
      vendorMessage = {
        body: !allItems.length
          ? "You don\u2019t have any items."
          : "I don\u2019t buy items of that sort.",
        acknowledge: back,
      };
    } else {
      vendorMessage = {
        body: !hasSold.current
          ? 'What would you like to sell?'
          : 'What else can you sell me?',
      };

      menu2 = (
        <BuildingMenu
          title="Item"
          options={sellableItems.map((item) => ({
            label: item.name,
            value: item.originalIndex,
          }))}
          onSelect={(i) => {
            setSelectedItemI(i);
            next();
          }}
          onCancel={back}
          level2
          hidden={step !== 0}
        />
      );
    }

    if (selectedItemI !== undefined) {
      if (step === 1) {
        const item = getPlayerItem(selectedItemI);

        vendorMessage = {
          body: `I\u2019d like to take that ${
            item.name
          } off your hands. I\u2019ll take it for ${
            item.price * ITEM_SHOP_SELL_MULTIPLIER
          } gold pieces.`,
          confirm: {
            yes: () => {
              sellItem(selectedItemI);
              hasSold.current = true;

              const remaining = getPlayerItems().filter((it) => isSellable(it.id));
              if (remaining.length) {
                back();
              } else {
                reset();
              }
            },
            no: () => {
              setSelectedItemI(undefined);
              back();
            },
          },
        };

        children = <ItemShopItemBox item={item} />;
      }
    }
  }

  return (
    <BuildingWrapper
      buildingId="10"
      vendorMessageBox={vendorMessage}
      menu={menu}
      menu2={menu2}
    >
      {children}
    </BuildingWrapper>
  );
}
