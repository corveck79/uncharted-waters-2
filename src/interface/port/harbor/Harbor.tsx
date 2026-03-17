import React, { ReactNode } from 'react';

import BuildingMenu from '../../common/BuildingMenu';
import { setSail } from '../../../state/actionsWorld';
import BuildingWrapper from '../BuildingWrapper';
import useBuilding from '../hooks/useBuilding';
import {
  CharacterMessageBoxType,
  VendorMessageBoxType,
} from '../../quest/getMessageBoxes';
import HarborSupply from './HarborSupply';
import {
  hasCrewAssigned,
  getPlayerFleet,
  getDaysProvisionsWillLast,
} from '../../../state/selectorsFleet';
import { getFirstMateId } from '../../../state/selectors';
import { checkIn } from '../../../state/actionsPort';
import HarborSummary from './HarborSummary';

const harborOptions = ['Sail', 'Supply', 'Moor'] as const;
type HarborOptions = typeof harborOptions[number];

const harborDisabledOptions: HarborOptions[] = [];

export default function Harbor() {
  const { selectOption, back, state } = useBuilding<HarborOptions>();

  const { option } = state;

  let vendorMessage: VendorMessageBoxType = {
    body: 'Ahoy there, matey, will ye be shoving off?',
  };

  let characterMessage: CharacterMessageBoxType = null;

  const menu = (
    <BuildingMenu
      options={harborOptions.map((s) => ({
        label: s,
        value: s,
        disabled: harborDisabledOptions.includes(s) || !getPlayerFleet().length,
      }))}
      onSelect={(s) => selectOption(s)}
      onCancel={back}
      hidden={option !== null}
    />
  );

  let children: ReactNode;

  let dark = false;

  if (option === 'Sail') {
    const speakerId = getFirstMateId();
    if (hasCrewAssigned()) {
      const days = getDaysProvisionsWillLast();

      if (days > 0) {
        characterMessage = {
          body:
            days >= 10
              ? `We can sail for ${days} days. Shall we cast off?`
              : "We won't be able to sail for long. Shall we cast off anyway?",
          characterId: speakerId,
          confirm: {
            yes: () => {
              setSail();
            },
            no: back,
          },
        };
      } else {
        characterMessage = {
          body: "We'll starve if we leave with no provisions!",
          characterId: speakerId,
          acknowledge: back,
        };
      }
    } else {
      characterMessage = {
        body: "Some ships have no crew assigned. We won't get anywhere.",
        characterId: speakerId,
        acknowledge: back,
      };
    }

    children = <HarborSummary />;

    dark = true;
  }

  if (option === 'Supply') {
    vendorMessage = null;
    children = <HarborSupply back={back} />;
  }

  if (option === 'Moor') {
    characterMessage = {
      body: 'We\u2019ll moor here for the night. The crew can get some rest.',
      characterId: getFirstMateId(),
      confirm: {
        yes: () => { checkIn(); },
        no: back,
      },
    };
  }

  return (
    <BuildingWrapper
      buildingId="4"
      vendorMessageBox={vendorMessage}
      characterMessageBox={characterMessage}
      menu={menu}
      dark={dark}
    >
      {children}
    </BuildingWrapper>
  );
}
