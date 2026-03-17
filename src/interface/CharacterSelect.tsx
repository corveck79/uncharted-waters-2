/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { useState, useEffect, useCallback } from 'react';

import { playerCharacters, PlayerCharacter, getStartingState } from '../data/playerCharacters';
import state, { SAVED_STATE_KEY } from '../state/state';
import Assets from '../assets';
import getSailor from '../data/sailorData';
import { classNames } from './interfaceUtils';

type Step = 'title' | 'select' | 'stats' | 'name';

interface Props {
  onSelect: () => void;
}

const KEYBOARD_ROWS = [
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
  ['U', 'V', 'W', 'X', 'Y', 'Z', '.', ',', "'", '-'],
  ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
  ['k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't'],
  ['u', 'v', 'w', 'x', 'y', 'z'],
];

// ─── Title Screen ──────────────────────────────────────────────────────────────

function TitleScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={onContinue}
    >
      <div className="text-center">
        <div
          className="text-6xl font-bold tracking-widest mb-2"
          style={{ color: '#d4a017', textShadow: '0 0 30px rgba(212,160,23,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}
        >
          UNCHARTED WATERS
        </div>
        <div
          className="text-3xl tracking-[0.3em] mb-12"
          style={{ color: '#8060c0', textShadow: '0 0 20px rgba(128,96,192,0.5)' }}
        >
          New Horizons
        </div>
        <div className="text-sm text-gray-500 tracking-widest mb-2">
          {'© 1994 KOEI Corporation'}
        </div>
        <div className="mt-16 text-sm text-gray-600 tracking-widest animate-pulse">
          CLICK TO START
        </div>
      </div>
    </div>
  );
}

// ─── Character Select Screen ───────────────────────────────────────────────────

function CharSelectScreen({
  selected,
  onSelect,
  onConfirm,
}: {
  selected: PlayerCharacter | null;
  onSelect: (c: PlayerCharacter) => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
      style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0d0d1a 100%)' }}
    >
      <div
        className="absolute inset-4 rounded"
        style={{ border: '2px solid rgba(201,168,76,0.3)', pointerEvents: 'none' }}
      />

      <h1
        className="text-2xl font-bold tracking-widest uppercase mb-1"
        style={{ color: '#c9a84c' }}
      >
        Uncharted Waters
      </h1>
      <p className="text-sm text-gray-400 mb-8 tracking-wide">Choose your voyager</p>

      <div className="grid grid-cols-3 gap-3 mb-6" style={{ width: '900px' }}>
        {playerCharacters.map((char) => {
          const sailor = getSailor(char.sailorId);
          const isSelected = selected?.id === char.id;
          const portrait = Assets.characters(char.sailorId);

          return (
            <div
              key={char.id}
              className={classNames(
                'flex gap-3 p-3 rounded cursor-pointer transition-all',
                isSelected
                  ? 'bg-[#2a2010] border border-[#c9a84c]'
                  : 'bg-[#111122] border border-[#333355] hover:border-[#555577]',
              )}
              onClick={() => onSelect(char)}
              onDoubleClick={() => {
                onSelect(char);
                onConfirm();
              }}
            >
              <img
                src={portrait}
                alt={char.name}
                className="flex-shrink-0"
                style={{ width: 48, height: 60, imageRendering: 'pixelated' }}
              />
              <div className="flex flex-col justify-between min-w-0">
                <div>
                  <div className="font-bold text-white text-sm truncate">{char.name}</div>
                  <div className="text-xs" style={{ color: '#c9a84c' }}>{char.nationality}</div>
                  <div className="text-xs text-gray-400 mt-1 leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {char.description}
                  </div>
                </div>
                <div className="text-xs text-gray-500 italic mt-1">{char.goal}</div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Age {sailor?.age}</span>
                  <span>{char.startingGold.toLocaleString()} G</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!selected}
        className={classNames(
          'px-10 py-2 text-base font-semibold rounded tracking-wide transition-all',
          selected
            ? 'bg-[#c9a84c] hover:bg-[#e0c060] text-black cursor-pointer'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed',
        )}
        onClick={onConfirm}
      >
        {selected ? `Select ${selected.name}` : 'Select a Voyager'}
      </button>
    </div>
  );
}

// ─── Stats Screen ──────────────────────────────────────────────────────────────

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs text-gray-400 w-24 text-right">{label}</span>
      <div className="flex-1 h-2 rounded bg-[#1a1a2e]" style={{ border: '1px solid #333' }}>
        <div
          className="h-full rounded"
          style={{ width: `${value}%`, background: 'linear-gradient(to right, #4a7c59, #6ab87a)' }}
        />
      </div>
      <span className="text-xs text-green-400 w-6 text-right">{value}</span>
    </div>
  );
}

function StatsScreen({
  character,
  onYes,
  onNo,
}: {
  character: PlayerCharacter;
  onYes: () => void;
  onNo: () => void;
}) {
  const sailor = getSailor(character.sailorId);
  const portrait = Assets.characters(character.sailorId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center select-none"
      style={{ background: 'rgba(0,0,0,0.9)' }}
    >
      <div
        className="flex gap-8 p-8 rounded"
        style={{
          background: 'linear-gradient(135deg, #1a1408 0%, #0d0d1a 100%)',
          border: '2px solid rgba(201,168,76,0.4)',
          width: 700,
          boxShadow: '0 0 60px rgba(0,0,0,0.8)',
        }}
      >
        {/* Portrait */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <img
            src={portrait}
            alt={character.name}
            style={{ width: 128, height: 160, imageRendering: 'pixelated' }}
          />
          <div className="text-center">
            <div className="text-sm text-gray-400">{character.nationality}</div>
            {character.startingDebt > 0 && (
              <div className="text-xs text-red-400 mt-1">
                Debt: {character.startingDebt.toLocaleString()}g
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1">
          <div className="text-2xl font-bold mb-1" style={{ color: '#c9a84c' }}>
            {character.name}
          </div>
          <div className="text-sm text-green-400 mb-1">Age {sailor?.age}</div>
          <div className="text-xs text-gray-300 leading-relaxed mb-4">
            {character.description}
          </div>

          {sailor && (
            <>
              <StatBar label="Leadership" value={sailor.stats.leadership} />
              <StatBar label="Seamanship" value={sailor.stats.seamanship} />
              <StatBar label="Knowledge" value={sailor.stats.knowledge} />
              <StatBar label="Intuition" value={sailor.stats.intuition} />
              <StatBar label="Courage" value={sailor.stats.courage} />
              <StatBar label="Swordplay" value={sailor.stats.swordplay} />
              <StatBar label="Charm" value={sailor.stats.charm} />
              <StatBar label="Luck" value={sailor.stats.luck} />

              <div className="flex gap-6 mt-3 mb-1 text-xs text-gray-400">
                <span>Navigation Lv. {sailor.navigationLevel}</span>
                <span>Battle Lv. {sailor.battleLevel}</span>
              </div>
              {sailor.skills.length > 0 && (
                <div className="text-xs text-amber-400">
                  Skills: {sailor.skills.join(', ')}
                </div>
              )}
            </>
          )}

          <div className="mt-4 text-sm text-gray-300 italic">{character.goal}</div>

          <div className="mt-6 flex items-center gap-4">
            <span className="text-white">Is this OK?</span>
            <button
              type="button"
              className="px-6 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-sm font-semibold"
              onClick={onYes}
            >
              YES
            </button>
            <button
              type="button"
              className="px-6 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-semibold"
              onClick={onNo}
            >
              NO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Name Entry Screen ─────────────────────────────────────────────────────────

function NameEntryScreen({
  defaultName,
  onConfirm,
}: {
  defaultName: string;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState(defaultName);

  const handleConfirm = useCallback(
    (n: string) => onConfirm(n || defaultName),
    [defaultName, onConfirm],
  );

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleConfirm(defaultName);
      } else if (e.key === 'Enter') {
        handleConfirm(name);
      } else if (e.key === 'Backspace') {
        setName((n) => n.slice(0, -1));
      } else if (e.key.length === 1) {
        setName((n) => (n.length < 20 ? n + e.key : n));
      }
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [name, handleConfirm, defaultName]);

  const pressKey = useCallback((key: string) => {
    setName((n) => (n.length < 20 ? n + key : n));
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center select-none"
      style={{ background: 'rgba(0,0,0,0.92)' }}
    >
      <div
        className="p-8 rounded flex flex-col items-center gap-5"
        style={{
          background: 'linear-gradient(135deg, #1a1408 0%, #0d0d1a 100%)',
          border: '2px solid rgba(201,168,76,0.4)',
          minWidth: 520,
          boxShadow: '0 0 60px rgba(0,0,0,0.8)',
        }}
      >
        <div className="text-sm text-gray-400 tracking-wide">
          Enter a new name. Select ESC to use the default name.
        </div>

        {/* Name display */}
        <div
          className="w-full px-4 py-2 rounded text-lg font-mono text-white flex items-center"
          style={{ background: '#0a0a14', border: '1px solid rgba(201,168,76,0.3)', minHeight: 44 }}
        >
          <span>{name}</span>
          <span className="animate-pulse text-amber-400 ml-0.5">_</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
            onClick={() => handleConfirm(defaultName)}
          >
            ESC (Default)
          </button>
          <button
            type="button"
            className="px-4 py-1 text-sm bg-amber-700 hover:bg-amber-600 text-white rounded"
            onClick={() => setName((n) => n.slice(0, -1))}
          >
            DEL
          </button>
          <button
            type="button"
            className="px-4 py-1 text-sm bg-green-700 hover:bg-green-600 text-white rounded font-semibold"
            onClick={() => handleConfirm(name)}
          >
            ENTER
          </button>
          <button
            type="button"
            className="px-4 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded"
            onClick={() => pressKey(' ')}
          >
            SPACE
          </button>
        </div>

        {/* Keyboard */}
        <div className="flex flex-col gap-1">
          {KEYBOARD_ROWS.map((row, ri) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={ri} className="flex gap-1 justify-center">
              {row.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="w-9 h-9 text-sm font-mono text-gray-200 rounded transition-colors hover:bg-amber-700 hover:text-white"
                  style={{ background: '#1a1a2e', border: '1px solid #333355' }}
                  onClick={() => pressKey(key)}
                >
                  {key === ' ' ? '\u00b7' : key}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CharacterSelect({ onSelect }: Props) {
  const [step, setStep] = useState<Step>('title');
  const [selected, setSelected] = useState<PlayerCharacter | null>(null);

  const handleConfirm = useCallback(
    (_name: string) => {
      if (!selected) return;
      const startingState = getStartingState(selected);
      Object.assign(state, startingState);
      window.localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(startingState));
      onSelect();
    },
    [selected, onSelect],
  );

  if (step === 'title') {
    return <TitleScreen onContinue={() => setStep('select')} />;
  }

  if (step === 'select') {
    return (
      <CharSelectScreen
        selected={selected}
        onSelect={setSelected}
        onConfirm={() => {
          if (selected) setStep('stats');
        }}
      />
    );
  }

  if (step === 'stats' && selected) {
    return (
      <StatsScreen
        character={selected}
        onYes={() => setStep('name')}
        onNo={() => setStep('select')}
      />
    );
  }

  if (step === 'name' && selected) {
    return (
      <NameEntryScreen
        defaultName={selected.name}
        onConfirm={handleConfirm}
      />
    );
  }

  return null;
}
