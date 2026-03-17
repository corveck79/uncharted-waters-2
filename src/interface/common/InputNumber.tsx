/* eslint-disable jsx-a11y/no-autofocus */

import React, { ChangeEvent, FormEvent, useState } from 'react';

import MessageBox from './MessageBox';
import { classNames } from '../interfaceUtils';
import Assets from '../../assets';
import useCancel from '../port/hooks/useCancel';

interface Props {
  limit: number;
  onComplete: (value: number) => void;
  onCancel: () => void;
  inlined?: true;
  min?: number;
  defaultValue?: number;
}

export default function InputNumber({
  limit,
  onComplete,
  onCancel,
  inlined,
  min = 0,
  defaultValue,
}: Props) {
  const [value, setValue] = useState(defaultValue ?? min);

  useCancel(onCancel);

  const inline = (
    <form
      className="flex items-end mt-4"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onComplete(value);
      }}
    >
      <div className="flex-1 pr-4">
        <input
          className={classNames(
            'w-full px-4 py-2',
            'border-2 border-[#d34100]',
            'focus:outline-none focus:ring-4 focus:ring-[#f3a261]',
          )}
          type="text"
          required
          value={value === 0 ? '0' : value || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (Number.isNaN(e.target.value)) {
              return;
            }

            let amount = Number(e.target.value);
            amount = Math.max(min, amount);
            amount = Math.min(limit, amount);

            setValue(amount);
          }}
          onClick={() => setValue(min)}
          autoFocus
          data-test="inputNumberInput"
        />
      </div>
      <button type="submit" data-test="inputNumberButton">
        <img
          src={Assets.images('dialogSubmit').toDataURL()}
          alt=""
          className="w-[92px] h-[44px]"
        />
      </button>
    </form>
  );

  if (inlined) {
    return inline;
  }

  return (
    <div className="absolute top-[500px] left-[276px]">
      <MessageBox>
        <div className="w-[450px] text-2xl p-4">{inline}</div>
      </MessageBox>
    </div>
  );
}
