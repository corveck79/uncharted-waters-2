import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import Right from './Right';
import Left from './Left';
import Provisions from './world/Provisions';
import Camera from './Camera';
import updateInterface from '../state/updateInterface';
import Building from './port/Building';
import { classNames } from './interfaceUtils';
import useFade from './port/hooks/useFade';
import CharacterSelect from './CharacterSelect';
import { SAVED_STATE_KEY } from '../state/state';
import SeaBattle from './battle/SeaBattle';
import CaptainDuel from './battle/CaptainDuel';
import type { BattleState } from '../game/world/seaBattle';

import './global.css';

const GAME_W = 1280;
const GAME_H = 800;

type Props = {
  /*
    The state of Interface is updated outside of React. This is made possible
    by assigning setStates to an outside object. Calls to that object's methods
    are delayed until Interface has mounted.

    Using a shared Redux Store could be a solution, but changes don't happen
    fast enough.
   */
  resolve: () => void;
};

function Interface({ resolve }: Props) {
  const [portId, setPortId] = useState<string | null>(null);
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [timePassed, setTimePassed] = useState(0);
  const [gold, setGold] = useState(0);
  const [needsCharacterSelect] = useState(
    () => !window.localStorage.getItem(SAVED_STATE_KEY),
  );
  const [characterSelected, setCharacterSelected] = useState(false);
  const [scale, setScale] = useState(
    () => Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H),
  );
  const [discoveryNotification, setDiscoveryNotification] = useState<{ title: string; body: string } | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveRef = useRef(resolve);

  const handleCharacterSelected = useCallback(() => {
    setCharacterSelected(true);
    resolveRef.current();
  }, []);

  useEffect(() => {
    if (!needsCharacterSelect) {
      resolve();
    }
  }, []);

  useEffect(() => {
    const updateScale = () => {
      setScale(Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H));
    };
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  updateInterface.general = (general) => {
    setPortId(general.portId);
    setBuildingId(general.buildingId);
    setTimePassed(general.timePassed);
    setGold(general.gold);
  };

  updateInterface.notification = (title, body) => {
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    setDiscoveryNotification({ title, body });
    notificationTimerRef.current = setTimeout(() => setDiscoveryNotification(null), 5000);
  };

  updateInterface.battle = (battle) => {
    setBattleState(battle);
  };

  const { fade, onAnimationEnd } = useFade();

  const inPort = portId !== null;
  const inDuel = battleState?.phase === 'duel';

  const gameLeft = Math.floor((window.innerWidth - GAME_W * scale) / 2);
  const gameTop = Math.floor((window.innerHeight - GAME_H * scale) / 2);

  return (
    <div className="[image-rendering:pixelated] fixed inset-0 bg-black overflow-hidden">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          left: `${gameLeft}px`,
          top: `${gameTop}px`,
        }}
        className={classNames(
          'w-[1280px] h-[800px] relative select-none',
          fade ? 'fade-out' : '',
        )}
        onAnimationEnd={onAnimationEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        {needsCharacterSelect && !characterSelected && (
          <CharacterSelect onSelect={handleCharacterSelected} />
        )}

        {buildingId !== null && <Building buildingId={buildingId} />}
        <div className={buildingId ? 'hidden' : ''}>
          <Camera />
        </div>

        {/* Left HUD overlay */}
        <div
          className="absolute top-0 left-0 h-full w-[180px] z-20"
          style={{
            background: 'linear-gradient(to right, rgba(5,10,22,1) 0%, rgba(8,14,32,0.99) 70%, rgba(8,14,32,0.97) 100%)',
            borderRight: '1px solid rgba(201,168,76,0.25)',
            boxShadow: 'inset -1px 0 0 rgba(201,168,76,0.08), 12px 0 28px rgba(0,0,0,0.55)',
          }}
        >
          <Left
            portId={portId}
            buildingId={buildingId}
            timePassed={timePassed}
            gold={gold}
          >
            <Provisions hidden={inPort} />
          </Left>
        </div>

        {/* Right HUD overlay */}
        <div
          className="absolute top-0 right-0 h-full w-[180px] z-10"
          style={{
            background: 'linear-gradient(to left, rgba(5,10,22,1) 0%, rgba(8,14,32,0.99) 70%, rgba(8,14,32,0.97) 100%)',
            borderLeft: '1px solid rgba(201,168,76,0.25)',
            boxShadow: 'inset 1px 0 0 rgba(201,168,76,0.08), -12px 0 28px rgba(0,0,0,0.55)',
          }}
        >
          <Right portId={portId} />
        </div>

        {/* Sea battle overlay */}
        {battleState && battleState.phase !== 'duel' && (
          <SeaBattle battle={battleState} />
        )}

        {/* Captain duel overlay (renders on top of sea battle) */}
        {battleState && inDuel && (
          <CaptainDuel battle={battleState} />
        )}

        {/* Discovery / battle notification */}
        {discoveryNotification && !battleState && (
          <div
            className="absolute bottom-6 left-1/2 z-50 pointer-events-none"
            style={{ transform: 'translateX(-50%)', width: 420 }}
          >
            <div
              className="rounded px-5 py-4"
              style={{
                background: 'linear-gradient(135deg, #1a1408 0%, #0d0d1a 100%)',
                border: '2px solid rgba(201,168,76,0.6)',
                boxShadow: '0 0 40px rgba(0,0,0,0.9)',
              }}
            >
              <div className="text-xs text-[#c9a84c] uppercase tracking-widest mb-1">Discovery!</div>
              <div className="text-base font-bold text-white mb-1">{discoveryNotification.title}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{discoveryNotification.body}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const renderInterface = () =>
  new Promise<void>((resolve) => {
    const container = document.getElementById('game');
    const root = createRoot(container!);
    root.render(
      <React.StrictMode>
        <Interface resolve={resolve} />
      </React.StrictMode>,
    );
  });

export default renderInterface;
