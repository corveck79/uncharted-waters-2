import state from '../../state/state';
import { finishedQuest, getPlayerSailorId } from '../../state/selectors';
import { QuestId } from './questData';
import { sample } from '../../utils';

const getCatalinaQuest = (buildingId: string): QuestId | null => {
  // 1. Navy HQ (palace/building 6): Commander Ezequiel delivers the news
  if (!finishedQuest('catalinaNavyHQ')) {
    if (buildingId === '6') return 'catalinaNavyHQ';
    return 'catalinaGenericBeforeNavyHQ';
  }

  // 2. Cafe (pub/building 2): overhear gossip, Emilio joins at gunpoint
  if (buildingId === '2') {
    if (!finishedQuest('catalinaCafe')) return 'catalinaCafe';
    return null;
  }

  if (!finishedQuest('catalinaCafe')) {
    return 'catalinaGenericBeforeNavyHQ';
  }

  // 3. Harbor (building 4): steal the REBEL
  if (buildingId === '4') {
    if (!finishedQuest('catalinaHarbor')) return 'catalinaHarbor';
    return null;
  }

  // Mid-game quests (after catalinaHarbor done)
  if (finishedQuest('catalinaHarbor')) {
    if (buildingId === '6' && state.fame.piracy >= 500 && !finishedQuest('catalinaReturnNavyHQ')) {
      return 'catalinaReturnNavyHQ';
    }
    if (buildingId === '2' && state.fame.piracy >= 5000 && !finishedQuest('catalinaKahnEncounter')) {
      return 'catalinaKahnEncounter';
    }
    // Finale: Selran confrontation — the bounty hunter finally faces her
    if (
      buildingId === '2' &&
      state.fame.piracy >= 25000 &&
      finishedQuest('catalinaKahnEncounter') &&
      !finishedQuest('catalinaFinaleSelran')
    ) {
      return 'catalinaFinaleSelran';
    }
  }

  return null;
};

const getErnstQuest = (buildingId: string): QuestId | null => {
  // 1. Palace (guild hall): Mercator commissions the world map
  if (buildingId === '6') {
    if (!finishedQuest('ernstPalaceMercator')) return 'ernstPalaceMercator';
    // Mid-game palace: Mercator receives progress report
    if (finishedQuest('ernstHarbor') && state.fame.adventure >= 5000 && !finishedQuest('ernstWorldMapProgress')) {
      return 'ernstWorldMapProgress';
    }
    // Finale: Ernst delivers the completed world map to Mercator
    if (
      finishedQuest('ernstWorldMapProgress') &&
      state.fame.adventure >= 40000 &&
      !finishedQuest('ernstFinaleMercator')
    ) {
      return 'ernstFinaleMercator';
    }
    return null;
  }

  // Before palace, all buildings redirect there
  if (!finishedQuest('ernstPalaceMercator')) {
    return 'ernstGenericBeforePalace';
  }

  // 2. Shipyard: pick up Meridian (Caravela Latina)
  if (buildingId === '3') {
    if (!finishedQuest('ernstShipyard')) return 'ernstShipyard';
    return null;
  }

  // 3. Harbor: Hans joins before departure, then depart
  if (buildingId === '4') {
    if (!finishedQuest('ernstShipyard')) return null;
    if (!finishedQuest('ernstHarborHans')) return 'ernstHarborHans';
    if (!finishedQuest('ernstHarbor')) return 'ernstHarbor';
    return null;
  }

  return null;
};

const getPietroQuest = (buildingId: string): QuestId | null => {
  // 1. Harbor: harbormaster sends Pietro to the pub
  if (buildingId === '4') {
    if (!finishedQuest('pietroHarborMaster')) return 'pietroHarborMaster';
    if (!finishedQuest('pietroShipyard')) return null;
    if (!finishedQuest('pietroHarbor')) return 'pietroHarbor';
    return null;
  }

  // Before first harbor visit, redirect there
  if (!finishedQuest('pietroHarborMaster')) {
    return 'pietroGenericBeforeHarbor';
  }

  // 2. Pub: Camillo + Duchess Franco deal, recruit Camillo
  if (buildingId === '2') {
    if (!finishedQuest('pietroPub')) return 'pietroPub';
    return null;
  }

  // Before pub, redirect there
  if (!finishedQuest('pietroPub')) {
    return 'pietroGenericBeforeHarbor';
  }

  // 3. Shipyard: pick up Falcon
  if (buildingId === '3') {
    if (!finishedQuest('pietroShipyard')) return 'pietroShipyard';
    return null;
  }

  return null;
};

const getAliQuest = (buildingId: string): QuestId | null => {
  // 1. Cafe (pub/building 2): Ladia redirects to shipyard
  if (buildingId === '2') {
    if (!finishedQuest('aliCafe')) return 'aliCafe';
    // Mid-game café quests (return null handled at end)
    if (finishedQuest('aliHarbor')) {
      if (!finishedQuest('aliLadiaRepay')) return 'aliLadiaRepay';
      if (
        state.fame.trade >= 45000 &&
        finishedQuest('aliVeniceSaphaAccepts') &&
        !finishedQuest('aliIstanbulEpilogue')
      ) {
        return 'aliIstanbulEpilogue';
      }
    }
    return null;
  }

  // Before cafe, redirect there
  if (!finishedQuest('aliCafe')) {
    return 'aliGenericBeforeCafe';
  }

  // 2. Shipyard: Salim, father's wrecked ship, creditors, get Savahni
  if (buildingId === '3') {
    if (!finishedQuest('aliShipyard')) return 'aliShipyard';
    return null;
  }

  // Before shipyard (cafe done, ship not yet), redirect
  if (!finishedQuest('aliShipyard')) {
    return 'aliGenericBeforeShipyard';
  }

  // 3. Palace: Sultan's trading mission (after getting the ship)
  if (buildingId === '6') {
    if (!finishedQuest('aliPalaceSultan')) return 'aliPalaceSultan';
    return null;
  }

  // Before palace (ship secured, sultan not yet seen), redirect
  if (!finishedQuest('aliPalaceSultan')) {
    return 'aliGenericBeforePalace';
  }

  // 4. Harbor: final departure
  if (buildingId === '4') {
    if (!finishedQuest('aliHarbor')) return 'aliHarbor';
    return null;
  }

  // Mid-game quests at home port (Istanbul) — palace only; café handled above
  if (finishedQuest('aliHarbor')) {
    if (buildingId === '6' && state.fame.trade >= 3000 && !finishedQuest('aliIstanbulSultanReturn')) {
      return 'aliIstanbulSultanReturn';
    }
  }

  return null;
};

const getOttoQuest = (buildingId: string): QuestId | null => {
  // 1. Palace: meet King Henry VIII, then Gilbert
  if (buildingId === '6') {
    if (!finishedQuest('ottoPalaceKingMission')) {
      return 'ottoPalaceKingMission';
    }
    if (!finishedQuest('ottoPalaceGilbert')) {
      return 'ottoPalaceGilbert';
    }
    return null;
  }

  // Before palace, all buildings send Otto to the palace
  if (!finishedQuest('ottoPalaceKingMission')) {
    return 'ottoGenericBeforeKing';
  }

  // 2. Shipyard: pick up the ship (Gilbert directed Otto here)
  if (buildingId === '3') {
    if (!finishedQuest('ottoShipyard')) {
      return 'ottoShipyard';
    }
    return null;
  }

  // 3. Harbor: meet Matthew (waiting as Gilbert promised)
  if (buildingId === '4') {
    if (!finishedQuest('ottoShipyard')) {
      return null;
    }
    if (!finishedQuest('ottoHarborMeetMatthew')) {
      return 'ottoHarborMeetMatthew';
    }
    if (!finishedQuest('ottoHarbor')) {
      return 'ottoHarbor';
    }
    return null;
  }

  // 4. Pub: recruit Matthew after meeting him at harbor
  if (buildingId === '2') {
    if (!finishedQuest('ottoHarborMeetMatthew')) {
      return null;
    }
    if (!finishedQuest('ottoPubMatthew')) {
      return 'ottoPubMatthew';
    }
    return null;
  }

  // Mid-game at London palace
  if (finishedQuest('ottoHarbor')) {
    if (
      buildingId === '6' &&
      state.fame.trade >= 30000 &&
      !finishedQuest('ottoLondonAdmiral')
    ) {
      return 'ottoLondonAdmiral';
    }
  }

  return null;
};

// ─── MIDGAME HELPERS ──────────────────────────────────────────────────────────

const getJoaoMidgameQuest = (portId: string, buildingId: string): QuestId | null => {
  // Lisbon mid-game quests
  if (portId === '1') {
    if (buildingId === '6' && state.fame.adventure >= 2000 && !finishedQuest('joaoPalaceAlberto')) {
      return 'joaoPalaceAlberto';
    }
    if (buildingId === '8' && finishedQuest('joaoPalaceAlberto') && !finishedQuest('joaoHouseAlberto')) {
      return 'joaoHouseAlberto';
    }
    if (buildingId === '2' && state.fame.adventure >= 23500 && !finishedQuest('joaoAliVisitLisbon')) {
      return 'joaoAliVisitLisbon';
    }
    // Finale: triumphant return — Alberto's fate resolved, João knighted
    if (
      buildingId === '6' &&
      state.fame.adventure >= 50000 &&
      finishedQuest('joaoPalaceAlberto') &&
      !finishedQuest('joaoFinaleLisbon')
    ) {
      return 'joaoFinaleLisbon';
    }
  }
  // Massawa mid-game quest
  if (portId === '75') {
    if (buildingId === '4' && state.fame.adventure >= 30000 && !finishedQuest('joaoMassawaFinal')) {
      return 'joaoMassawaFinal';
    }
  }
  return null;
};

const getCatalinaMidgameQuest = (portId: string, buildingId: string): QuestId | null => {
  // Alexandria
  if (portId === '19') {
    if (
      buildingId === '2' &&
      state.fame.piracy >= 8000 &&
      !finishedQuest('catalinaAlexandria')
    ) {
      return 'catalinaAlexandria';
    }
  }
  // Massawa
  if (portId === '75') {
    if (
      buildingId === '4' &&
      state.fame.piracy >= 15000 &&
      !finishedQuest('catalinaMassawa')
    ) {
      return 'catalinaMassawa';
    }
  }
  return null;
};

const getOttoMidgameQuest = (portId: string, buildingId: string): QuestId | null => {
  // Seville
  if (portId === '2') {
    if (
      buildingId === '2' &&
      state.fame.trade >= 1000 &&
      !finishedQuest('ottoSevilleSpyMission')
    ) {
      return 'ottoSevilleSpyMission';
    }
  }
  // Nantes
  if (portId === '29') {
    if (
      buildingId === '2' &&
      state.fame.trade >= 5000 &&
      !finishedQuest('ottoNantesIntelligence')
    ) {
      return 'ottoNantesIntelligence';
    }
  }
  // Genoa
  if (portId === '9') {
    if (
      buildingId === '2' &&
      state.fame.trade >= 8000 &&
      !finishedQuest('ottoCatalinaMeeting')
    ) {
      return 'ottoCatalinaMeeting';
    }
  }
  return null;
};

const getErnstMidgameQuest = (portId: string, buildingId: string): QuestId | null => {
  // Nagasaki
  if (portId === '100') {
    if (
      buildingId === '2' &&
      state.fame.adventure >= 20000 &&
      !finishedQuest('ernstHansZipangu')
    ) {
      return 'ernstHansZipangu';
    }
  }
  // Lisbon pub: Hans opens up about his past after building adventure fame
  if (portId === '1') {
    if (
      buildingId === '2' &&
      state.fame.adventure >= 25000 &&
      !finishedQuest('ernstHansLisbon')
    ) {
      return 'ernstHansLisbon';
    }
  }
  return null;
};

const getPietroMidgameQuest = (portId: string, buildingId: string): QuestId | null => {
  // Lisbon: meet Duchess
  if (portId === '1') {
    if (buildingId === '6' && !finishedQuest('pietroLisbonMeetDuchess')) {
      return 'pietroLisbonMeetDuchess';
    }
    if (
      buildingId === '6' &&
      state.fame.adventure >= 40000 &&
      finishedQuest('pietroLisbonMeetDuchess') &&
      !finishedQuest('pietroLisbonEpilogue')
    ) {
      return 'pietroLisbonEpilogue';
    }
  }
  // Cairo: El Dorado map fragment
  if (portId === '76') {
    if (
      buildingId === '2' &&
      state.fame.adventure >= 10000 &&
      !finishedQuest('pietroAfricaElDorado')
    ) {
      return 'pietroAfricaElDorado';
    }
  }
  // Naples: fortune teller
  if (portId === '11') {
    if (
      buildingId === '2' &&
      state.fame.adventure >= 15000 &&
      !finishedQuest('pietroFortuneTeller')
    ) {
      return 'pietroFortuneTeller';
    }
  }
  // Massawa: Staff of Poseidon
  if (portId === '75') {
    if (
      buildingId === '4' &&
      state.fame.adventure >= 20000 &&
      !finishedQuest('pietroMassawaStaff')
    ) {
      return 'pietroMassawaStaff';
    }
  }
  // Nagasaki: meet Ernst
  if (portId === '100') {
    if (
      buildingId === '2' &&
      state.fame.adventure >= 30000 &&
      !finishedQuest('pietroNagasaki')
    ) {
      return 'pietroNagasaki';
    }
  }
  // Cayenne: Raul Franco
  if (portId === '57') {
    if (
      buildingId === '4' &&
      state.fame.adventure >= 35000 &&
      !finishedQuest('pietroCayenne')
    ) {
      return 'pietroCayenne';
    }
  }
  return null;
};

const getAliMidgameQuest = (portId: string, buildingId: string): QuestId | null => {
  // Basra: find Sapha
  if (portId === '77') {
    if (
      buildingId === '2' &&
      state.fame.trade >= 8000 &&
      !finishedQuest('aliBasraSapha')
    ) {
      return 'aliBasraSapha';
    }
  }
  // Venice: Howell + Sapha epilogue
  if (portId === '14') {
    if (buildingId === '2') {
      if (
        state.fame.trade >= 40000 &&
        finishedQuest('aliBasraSapha') &&
        !finishedQuest('aliVeniceSaphaAccepts')
      ) {
        return 'aliVeniceSaphaAccepts';
      }
      if (
        state.fame.trade >= 12000 &&
        !finishedQuest('aliVeniceHowell')
      ) {
        return 'aliVeniceHowell';
      }
    }
  }
  return null;
};

// ─── TIMING HELPER ────────────────────────────────────────────────────────────

const between22and24 = (timePassed: number) => {
  const timePassedToday = timePassed % 1440;

  return timePassedToday >= 1320 || timePassedToday === 0;
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

const getAvailableQuest = (): QuestId | null => {
  const { portId, buildingId, timePassed } = state;

  if (!buildingId) {
    return null;
  }

  const playerSailorId = getPlayerSailorId();

  // ── HOME PORT OPENERS ──────────────────────────────────────────────────────

  if (portId === '30') {
    return getOttoQuest(buildingId);
  }

  if (portId === '4') {
    return getCatalinaQuest(buildingId);
  }

  if (portId === '34') {
    return getErnstQuest(buildingId);
  }

  // Genoa is Pietro's home port, but also used for Otto's mid-game meeting
  if (portId === '9') {
    if (playerSailorId === '5') {
      return getPietroQuest(buildingId);
    }
    // Non-Pietro characters at Genoa — mid-game routing below
  }

  if (portId === '3') {
    return getAliQuest(buildingId);
  }

  // ── LISBON (portId '1') ────────────────────────────────────────────────────
  // Handles João's full opening sequence + mid-game for João and Pietro

  if (portId === '1') {
    // Pietro mid-game at Lisbon (Duchess meeting, epilogue) — runs before João opening
    if (playerSailorId === '5' && finishedQuest('pietroHarbor')) {
      const q = getPietroMidgameQuest(portId, buildingId);
      if (q) return q;
    }

    // João mid-game quests in Lisbon
    if (playerSailorId === '1' && finishedQuest('harborFinal')) {
      const q = getJoaoMidgameQuest(portId, buildingId);
      if (q) return q;
    }

    // João opening sequence (non-harborFinal paths)
    if (buildingId === '8') {
      if (!finishedQuest('houseBeforeQuest')) {
        return 'houseBeforeQuest';
      }

      if (!finishedQuest('houseAfterQuestAndPub')) {
        if (finishedQuest('pubAfterQuest') && between22and24(timePassed)) {
          return 'houseAfterQuestAndPub';
        }
        return 'houseAfterQuest';
      }

      return 'houseAfterQuestAndPub2';
    }

    if (buildingId === '2') {
      if (!finishedQuest('houseBeforeQuest')) {
        if (!finishedQuest('pubBeforeQuest')) {
          return 'pubBeforeQuest';
        }

        return 'pubBeforeQuest2';
      }

      if (!finishedQuest('pubAfterQuest')) {
        return 'pubAfterQuest';
      }

      if (!finishedQuest('houseAfterQuestAndPub')) {
        return 'pubAfterQuest2';
      }

      return 'pubCarlottaGreeting';
    }

    if (['5', '7', '9'].includes(buildingId)) {
      if (!finishedQuest('houseBeforeQuest')) {
        return sample([
          'lodgeBankGuildBeforeQuestRandom1',
          'lodgeBankGuildBeforeQuestRandom2',
          'lodgeBankGuildBeforeQuestRandom3',
        ]);
      }

      return sample([
        'lodgeBankGuildAfterQuestRandom1',
        'lodgeBankGuildAfterQuestRandom2',
        'lodgeBankGuildAfterQuestRandom3',
      ]);
    }

    if (buildingId === '6') {
      if (!finishedQuest('houseBeforeQuest')) {
        return 'palaceBeforeQuest';
      }

      return 'palaceAfterQuest';
    }

    if (buildingId === '10') {
      if (!finishedQuest('houseBeforeQuest')) {
        return 'itemShopBeforeQuest';
      }

      if (!finishedQuest('itemShopAfterQuest')) {
        return 'itemShopAfterQuest';
      }

      return 'itemShopAfterQuest2';
    }

    if (buildingId === '3') {
      if (!finishedQuest('houseBeforeQuest')) {
        return 'shipyardBeforeQuest';
      }

      if (!finishedQuest('shipyardAfterQuest')) {
        return 'shipyardAfterQuest';
      }

      return null;
    }

    if (buildingId === '11') {
      if (!finishedQuest('houseBeforeQuest')) {
        if (!finishedQuest('churchBeforeQuest')) {
          return 'churchBeforeQuest';
        }

        return 'churchBeforeQuest2';
      }

      if (!finishedQuest('churchAfterEnrico')) {
        if (!finishedQuest('churchAfterQuest')) {
          return 'churchAfterQuest';
        }

        return 'churchAfterEnrico';
      }

      return 'churchAfterEnricoAfterGift';
    }

    if (buildingId === '1') {
      if (!finishedQuest('houseBeforeQuest')) {
        return 'marketBeforeQuest';
      }

      if (!finishedQuest('shipyardAfterQuest')) {
        return 'marketAfterQuestBeforeShip';
      }

      return null;
    }

    if (buildingId === '4') {
      if (!finishedQuest('houseBeforeQuest')) {
        return 'harborBeforeQuest';
      }

      if (!finishedQuest('shipyardAfterQuest')) {
        return 'harborBeforeShip';
      }

      if (!finishedQuest('churchAfterQuest')) {
        return 'harborBeforeEnrico';
      }

      if (!finishedQuest('pubAfterQuest')) {
        if (!finishedQuest('churchAfterEnrico')) {
          return 'harborAfterEnrico';
        }

        return 'harborAfterEnrico2';
      }

      if (!finishedQuest('houseAfterQuestAndPub')) {
        return 'harborAfterEnricoBeforeMother';
      }

      if (!finishedQuest('harborFinal')) {
        return 'harborFinal';
      }
    }

    return null;
  }

  // ── MID-GAME ROUTING FOR NON-HOME PORTS ───────────────────────────────────

  if (playerSailorId === '1' && finishedQuest('harborFinal')) {
    const q = getJoaoMidgameQuest(portId, buildingId);
    if (q) return q;
  }

  if (playerSailorId === '3' && finishedQuest('catalinaHarbor')) {
    const q = getCatalinaMidgameQuest(portId, buildingId);
    if (q) return q;
  }

  if (playerSailorId === '2' && finishedQuest('ottoHarbor')) {
    const q = getOttoMidgameQuest(portId, buildingId);
    if (q) return q;
  }

  if (playerSailorId === '4' && finishedQuest('ernstHarbor')) {
    const q = getErnstMidgameQuest(portId, buildingId);
    if (q) return q;
  }

  if (playerSailorId === '5' && finishedQuest('pietroHarbor')) {
    const q = getPietroMidgameQuest(portId, buildingId);
    if (q) return q;
  }

  if (playerSailorId === '6' && finishedQuest('aliHarbor')) {
    const q = getAliMidgameQuest(portId, buildingId);
    if (q) return q;
  }

  return null;
};

export default getAvailableQuest;
