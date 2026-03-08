/*
  Indicators frequently change, and in particular for the player's fleet.
  In the event of rapidly changing directions, updating direction and speed
  through Redux or setState is too slow (> 10ms) and causes noticeable
  CPU usage.
 */

import React, { useRef } from 'react';

import Assets from '../../assets';
import updateInterface from '../../state/updateInterface';
import { State } from '../../state/state';
import { classNames } from '../interfaceUtils';

interface Props {
  hidden: boolean;
}

export default function Indicators({ hidden }: Props) {
  const windDirectionRef = useRef<HTMLImageElement>(null!);
  const windSpeedRef = useRef<HTMLDivElement>(null!);
  const currentDirectionRef = useRef<HTMLImageElement>(null!);
  const currentSpeedRef = useRef<HTMLDivElement>(null!);

  const playerFleetDirectionRef = useRef<HTMLImageElement>(null!);
  const playerFleetSpeedRef = useRef<HTMLImageElement>(null!);

  updateInterface.indicators = ({
    wind,
    current,
  }: Pick<State, 'wind' | 'current'>) => {
    windDirectionRef.current.src = Assets.indicators(wind.direction);
    windSpeedRef.current.textContent = String(wind.speed);

    currentDirectionRef.current.src = Assets.indicators(current.direction);
    currentSpeedRef.current.textContent = String(current.speed);
  };

  updateInterface.playerFleetDirection = (direction: number) => {
    playerFleetDirectionRef.current.src = Assets.indicators(direction);
  };

  updateInterface.playerFleetSpeed = (speed: number) => {
    playerFleetSpeedRef.current.textContent = String(Math.floor(speed / 2));
  };

  return (
    <div
      className={classNames(
        'p-5 space-y-6',
        hidden ? 'hidden' : '',
      )}
    >
      {/* Wind */}
      <div>
        <div className="text-xs text-[#aaaaaa] uppercase tracking-widest mb-2">Wind</div>
        <div className="flex items-center justify-between">
          <img className="w-10 h-10" ref={windDirectionRef} alt="" />
          <div className="text-2xl font-bold" ref={windSpeedRef} />
        </div>
      </div>

      {/* Current */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
        <div className="text-xs text-[#aaaaaa] uppercase tracking-widest mb-2">Current</div>
        <div className="flex items-center justify-between">
          <img className="w-10 h-10" ref={currentDirectionRef} alt="" />
          <div className="text-2xl font-bold" ref={currentSpeedRef} />
        </div>
      </div>

      {/* Your fleet */}
      <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)', paddingTop: '1rem' }}>
        <div className="text-xs text-[#c9a84c] uppercase tracking-widest mb-2">Your fleet</div>
        <div className="flex items-center justify-between">
          <img className="w-10 h-10" ref={playerFleetDirectionRef} alt="" />
          <div className="text-right">
            <div className="text-2xl font-bold" ref={playerFleetSpeedRef} />
            <div className="text-xs text-[#aaaaaa]">knots</div>
          </div>
        </div>
      </div>
    </div>
  );
}
