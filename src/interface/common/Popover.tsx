/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { Fragment, ReactNode, useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';

import { classNames } from '../interfaceUtils';

interface Props {
  label: string;
  children: ReactNode;
}

export default function Popover({ label, children }: Props) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const onKeydown = (e: KeyboardEvent) => {
      const pressedKey = e.key.toLowerCase();

      if (pressedKey === 'escape') {
        e.preventDefault();
        setActive(false);
      }
    };

    const onContextmenu = (e: MouseEvent) => {
      e.preventDefault();
      setActive(false);
    };

    window.addEventListener('keydown', onKeydown);
    window.addEventListener('contextmenu', onContextmenu);

    return () => {
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('contextmenu', onContextmenu);
    };
  });

  return (
    <>
      <Transition
        show={active}
        as={Fragment}
        enter="ease-out duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-75 transition-opacity z-30"
          onClick={() => setActive(false)}
        />
      </Transition>
      <div
        className={classNames(
          'relative cursor-pointer transition-all duration-100',
          'border-t border-white/10',
          active
            ? 'bg-[#c9a84c]/20'
            : 'hover:bg-[#c9a84c]/10',
        )}
        onClick={() => setActive(true)}
        style={active ? { borderLeft: '3px solid #c9a84c' } : { borderLeft: '3px solid transparent' }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span
            className={classNames(
              'text-sm tracking-widest uppercase font-medium',
              active ? 'text-[#c9a84c]' : 'text-[#aaaaaa]',
            )}
          >
            {label}
          </span>
          <span
            className={classNames(
              'text-xs',
              active ? 'text-[#c9a84c]' : 'text-[#555555]',
            )}
          >
            ▶
          </span>
        </div>
        {active && (
          <div
            className="fixed inset-0 flex items-center justify-center z-40"
            style={{ pointerEvents: 'none' }}
          >
            <div style={{ pointerEvents: 'auto' }}>
              {children}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
