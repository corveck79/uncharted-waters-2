/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/solid';

import {
  getSaveSlots,
  saveToSlot,
  loadFromSlot,
  deleteSlot,
  SaveSlot,
  NUM_SLOTS,
} from '../state/saveLoad';
import { SAVED_STATE_KEY } from '../state/state';
import { audioState } from './sound/audioState';
import MessageBox from './common/MessageBox';

type Confirm = { type: 'save' | 'load' | 'delete' | 'newGame' | 'exitGame'; slotIndex: number } | null;

function formatSavedAt(savedAt: number): string {
  return new Date(savedAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface SlotRowProps {
  slot: SaveSlot;
  onAction: (confirm: Confirm) => void;
}

function SlotRow({ slot, onAction }: SlotRowProps) {
  const isEmpty = slot.savedAt === null;

  return (
    <div className="mb-1 p-2" style={{ border: '1px solid rgba(211,65,0,0.3)', background: 'rgba(211,65,0,0.04)' }}>
      <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(0,0,0,0.5)' }}>
        Slot {slot.index + 1}
      </div>
      {isEmpty ? (
        <div className="flex items-center justify-between">
          <span className="text-sm italic" style={{ color: 'rgba(0,0,0,0.35)' }}>Empty</span>
          <button
            type="button"
            className="px-3 py-0.5 text-xs bg-black text-white cursor-pointer hover:bg-[#222]"
            onClick={() => onAction({ type: 'save', slotIndex: slot.index })}
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <div className="text-sm font-bold text-black">{slot.portName}</div>
          <div className="text-xs" style={{ color: 'rgba(0,0,0,0.55)' }}>{slot.gameDate}</div>
          <div className="text-xs mb-2" style={{ color: 'rgba(0,0,0,0.35)' }}>{formatSavedAt(slot.savedAt!)}</div>
          <div className="flex gap-1">
            <button
              type="button"
              className="flex-1 py-0.5 text-xs bg-black text-white cursor-pointer hover:bg-[#222]"
              onClick={() => onAction({ type: 'save', slotIndex: slot.index })}
            >
              Save
            </button>
            <button
              type="button"
              className="flex-1 py-0.5 text-xs bg-black text-white cursor-pointer hover:bg-[#222]"
              onClick={() => onAction({ type: 'load', slotIndex: slot.index })}
            >
              Load
            </button>
            <button
              type="button"
              className="px-2 py-0.5 text-xs bg-black text-white cursor-pointer hover:bg-red-900"
              onClick={() => onAction({ type: 'delete', slotIndex: slot.index })}
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface ConfirmDialogProps {
  confirm: Confirm;
  slots: SaveSlot[];
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ confirm, slots, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!confirm) return null;

  const slot = slots[confirm.slotIndex];
  const messages: Record<string, string> = {
    save: slot?.savedAt
      ? `Overwrite slot ${confirm.slotIndex + 1}?`
      : `Save to slot ${confirm.slotIndex + 1}?`,
    load: `Load slot ${confirm.slotIndex + 1}? Unsaved progress will be lost.`,
    delete: `Delete slot ${confirm.slotIndex + 1}?`,
    newGame: 'Start a new game? Current progress will be lost.',
    exitGame: 'Exit the game?',
  };

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid #d34100' }}>
      <div className="text-sm text-black mb-3">{messages[confirm.type]}</div>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 py-1 text-sm bg-black text-white cursor-pointer hover:bg-[#222]"
          onClick={onConfirm}
        >
          Yes
        </button>
        <button
          type="button"
          className="flex-1 py-1 text-sm bg-black text-white cursor-pointer hover:bg-[#222]"
          onClick={onCancel}
        >
          No
        </button>
      </div>
    </div>
  );
}

export default function SaveLoad() {
  const [slots, setSlots] = useState<SaveSlot[]>(() => getSaveSlots());
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [volume, setVolume] = useState(() => audioState.volume);
  const [muted, setMuted] = useState(() => audioState.muted);

  const refresh = () => setSlots(getSaveSlots());

  const handleAction = (action: Confirm) => setConfirm(action);

  const handleConfirm = () => {
    if (!confirm) return;

    if (confirm.type === 'save') {
      saveToSlot(confirm.slotIndex);
      refresh();
    } else if (confirm.type === 'load') {
      loadFromSlot(confirm.slotIndex);
    } else if (confirm.type === 'delete') {
      deleteSlot(confirm.slotIndex);
      refresh();
    } else if (confirm.type === 'newGame') {
      window.localStorage.removeItem(SAVED_STATE_KEY);
      window.location.reload();
    } else if (confirm.type === 'exitGame') {
      window.close();
    }

    setConfirm(null);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    audioState.setVolume(v);
    if (muted && v > 0) {
      setMuted(false);
      audioState.setMuted(false);
    }
  };

  const handleMuteToggle = () => {
    const next = !muted;
    setMuted(next);
    audioState.setMuted(next);
  };

  return (
    <MessageBox>
      <div className="w-56 text-black">

        {/* Header */}
        <div
          className="text-xl font-bold text-center uppercase mb-3 pb-2"
          style={{ borderBottom: '2px solid #d34100' }}
        >
          Menu
        </div>

        {/* Save / Load */}
        <div
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: 'rgba(0,0,0,0.5)' }}
        >
          Save / Load
        </div>
        {Array.from({ length: NUM_SLOTS }, (_, i) => (
          <SlotRow key={i} slot={slots[i]} onAction={handleAction} />
        ))}

        {/* Sound */}
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(211,65,0,0.4)' }}>
          <div
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: 'rgba(0,0,0,0.5)' }}
          >
            Sound
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMuteToggle}
              className="px-2 py-0.5 text-sm bg-black text-white cursor-pointer hover:bg-[#222] flex-shrink-0"
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 cursor-pointer [accent-color:#d34100]"
            />
            <span className="text-xs w-7 text-right flex-shrink-0" style={{ color: 'rgba(0,0,0,0.4)' }}>
              {muted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>

        {/* New Game / Exit */}
        <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid rgba(211,65,0,0.4)' }}>
          <button
            type="button"
            className="w-full py-2 text-sm bg-black text-white uppercase tracking-widest cursor-pointer hover:bg-[#222] transition-colors"
            onClick={() => setConfirm({ type: 'newGame', slotIndex: 0 })}
          >
            New Game
          </button>
          <button
            type="button"
            className="w-full py-2 text-sm bg-black text-white uppercase tracking-widest cursor-pointer hover:bg-red-900 transition-colors"
            onClick={() => setConfirm({ type: 'exitGame', slotIndex: 0 })}
          >
            Exit Game
          </button>
        </div>

        {confirm && (
          <ConfirmDialog
            confirm={confirm}
            slots={slots}
            onConfirm={handleConfirm}
            onCancel={() => setConfirm(null)}
          />
        )}

      </div>
    </MessageBox>
  );
}
