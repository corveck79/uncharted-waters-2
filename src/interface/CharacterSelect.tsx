/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { useState } from 'react';

import { playerCharacters, PlayerCharacter, getStartingState } from '../data/playerCharacters';
import state, { SAVED_STATE_KEY } from '../state/state';
import { classNames } from './interfaceUtils';

const flagEmoji: Record<string, string> = {
  Portugal: '🇵🇹',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Spain: '🇪🇸',
  Holland: '🇳🇱',
  Italy: '🇮🇹',
  Ottoman: '🕌',
};

interface Props {
  onSelect: () => void;
}

export default function CharacterSelect({ onSelect }: Props) {
  const [selected, setSelected] = useState<PlayerCharacter | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!selected) return;

    const startingState = getStartingState(selected);

    // Apply to live state object
    Object.assign(state, startingState);

    // Persist so reload/save works
    window.localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(startingState));

    setConfirmed(true);
    onSelect();
  };

  if (confirmed) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a14] flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-amber-400 mb-2 tracking-widest uppercase">
        Uncharted Waters
      </h1>
      <p className="text-gray-400 mb-10 text-sm tracking-wide">
        Choose your voyager
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-4xl px-4">
        {playerCharacters.map((char) => {
          const isSelected = selected?.id === char.id;
          return (
            <div
              key={char.id}
              className={classNames(
                'border rounded p-4 cursor-pointer transition-all',
                isSelected
                  ? 'border-amber-400 bg-gray-800'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-500 hover:bg-gray-850',
              )}
              onClick={() => setSelected(char)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{flagEmoji[char.nationality] ?? '🌊'}</span>
                <span className="font-bold text-white text-sm">{char.name}</span>
              </div>
              <div className="text-xs text-amber-500 mb-2">{char.nationality}</div>
              <div className="text-xs text-gray-300 leading-relaxed mb-3">
                {char.description}
              </div>
              <div className="text-xs text-gray-500 italic">{char.goal}</div>
              <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-xs text-gray-400">
                <span>Gold: {char.startingGold.toLocaleString()}</span>
                {char.startingDebt > 0 && (
                  <span className="text-red-400">Debt: {char.startingDebt.toLocaleString()}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selected}
        className={classNames(
          'px-10 py-3 text-lg font-semibold rounded tracking-wide transition-all',
          selected
            ? 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed',
        )}
        onClick={handleConfirm}
      >
        {selected ? `Set Sail as ${selected.name}` : 'Select a voyager'}
      </button>
    </div>
  );
}
