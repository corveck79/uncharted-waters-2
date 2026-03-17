import { useEffect, useRef, useState } from 'react';

import { getRegionOrIfSupplyPort } from '../../game/port/portUtils';
import { audioState } from './audioState';

import mastInTheMist from './assets/mast-in-the-mist.ogg';
import themeOfJoao from './assets/theme-of-joão.ogg';
import fiddlersGreen from './assets/fiddlers-green.ogg';
import royalPalace from './assets/royal-palace.ogg';
import supplyPort from './assets/supply-port.ogg';
import emptyEyes from './assets/empty-eyes.ogg';
import theMahout from './assets/the-mahout.ogg';
import landOfLuxury from './assets/land-of-luxury.ogg';
import moslemDance from './assets/moslem-dance.ogg';

/*
  https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide

  As Sound is never unmounted, calling pause() as described in
  https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement/Audio#memory_usage_and_management
  won't be necessary.
*/

const getAudioElement = () => {
  const audio = new Audio();
  audio.loop = true;
  return audio;
};

const getTrack = ({ portId, buildingId }: Props) => {
  if (portId === null) {
    return themeOfJoao;
  }

  if (buildingId === '2') {
    return fiddlersGreen;
  }

  if (buildingId === '6') {
    return royalPalace;
  }

  const region = getRegionOrIfSupplyPort(portId);

  if (region === 'Supply port') {
    return supplyPort;
  }

  if (['Ottoman Empire', 'Middle East'].includes(region)) {
    return moslemDance;
  }

  if (
    [
      'North Africa',
      'East Africa',
      'West Africa',
      'Central America',
      'South America',
    ].includes(region)
  ) {
    return emptyEyes;
  }

  if (['India'].includes(region)) {
    return theMahout;
  }

  if (['Southeast Asia', 'Far East'].includes(region)) {
    return landOfLuxury;
  }

  return mastInTheMist;
};

interface Props {
  portId: string | null;
  buildingId: string | null;
}

export default function Sound({ portId, buildingId }: Props) {
  const audioRef = useRef(getAudioElement());
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    audioState.register(audioRef.current);
  }, []);

  const triggerAutoplay = () => {
    audioRef.current.play().catch(() => {});
    setHasPlayed(true);
  };

  useEffect(() => {
    const track = getTrack({ portId, buildingId });
    if (audioRef.current.src !== track) {
      audioRef.current.src = track;
      audioRef.current.play().catch(() => {});
    }
  }, [portId, buildingId]);

  useEffect(() => {
    if (hasPlayed) {
      return undefined;
    }

    window.addEventListener('click', triggerAutoplay);
    window.addEventListener('keydown', triggerAutoplay);

    return () => {
      window.removeEventListener('click', triggerAutoplay);
      window.removeEventListener('keydown', triggerAutoplay);
    };
  }, [hasPlayed]);

  return null;
}

/*
 TODO
  Fall back to mp3 if ogg is not supported, using HTMLMediaElement.canPlayType()
  require.context() may come in handy

 TODO fade
*/
