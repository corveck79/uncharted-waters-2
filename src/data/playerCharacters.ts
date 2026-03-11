import { START_TIME_PASSED } from '../constants';

export interface PlayerCharacter {
  id: string;
  sailorId: string;
  name: string;
  nationality: string;
  goal: string;
  description: string;
  startingPortId: string;
  startingGold: number;
  startingDebt: number;
}

export const playerCharacters: PlayerCharacter[] = [
  {
    id: '1',
    sailorId: '1',
    name: 'João Franco',
    nationality: 'Portugal',
    goal: 'Discover Atlantis',
    description:
      'As the son of Duke Leon Franco, João sails for the glory of Portugal. He hopes to discover the secret of the lost land of Atlantis.',
    startingPortId: '1',
    startingGold: 1000,
    startingDebt: 0,
  },
  {
    id: '2',
    sailorId: '2',
    name: 'Otto Baynes',
    nationality: 'England',
    goal: 'Defeat the Spanish Fleet',
    description:
      'A Royal Knight of the British Empire, Otto is on a secret mission for King Henry VIII. Sailing as a privateer, his goal is to defeat the Spanish Fleet.',
    startingPortId: '30',
    startingGold: 1500,
    startingDebt: 0,
  },
  {
    id: '3',
    sailorId: '3',
    name: 'Catalina Erantzo',
    nationality: 'Spain',
    goal: 'Seek Revenge on Portugal',
    description:
      'This red-haired pirate hails from Spain. She seeks revenge on Portugal for the mysterious loss of two men — her brother and her beloved.',
    startingPortId: '4',
    startingGold: 800,
    startingDebt: 0,
  },
  {
    id: '4',
    sailorId: '4',
    name: 'Ernst von Bohr',
    nationality: 'Holland',
    goal: 'Map the World',
    description:
      'Ernst is a famous geographer from Holland. At the request of his cartographer friend Mercator, he sets sail to plot out a detailed map of the world.',
    startingPortId: '34',
    startingGold: 2000,
    startingDebt: 0,
  },
  {
    id: '5',
    sailorId: '5',
    name: 'Pietro Conti',
    nationality: 'Italy',
    goal: 'Find Treasure',
    description:
      'The Conti family went bankrupt long ago, leaving Pietro a large debt. But that won\'t stop him from exploring the world in search of treasure and exotic items.',
    startingPortId: '9',
    startingGold: 500,
    startingDebt: 5000,
  },
  {
    id: '6',
    sailorId: '6',
    name: 'Ali Vezas',
    nationality: 'Ottoman',
    goal: 'Make a Fortune Trading',
    description:
      'Ali has struggled to make ends meet in Istanbul since he was a child. Now, with a merchant ship, he will try to make his fortune trading in foreign lands.',
    religion: 'muslim',
    startingPortId: '3',
    startingGold: 1200,
    startingDebt: 0,
  },
];

const genUid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export function getStartingState(character: PlayerCharacter) {
  // The other 5 characters sail the world as NPC rivals (fleets '2'–'6')
  const npcFleets: Record<string, { position: undefined; ships: object[] }> = {};
  let fleetId = 2;
  for (const npc of playerCharacters) {
    if (npc.id === character.id) continue;
    npcFleets[String(fleetId)] = {
      position: undefined,
      ships: [
        {
          uid: genUid(),
          id: '6', // Caravela Latina
          name: `${npc.name}'s Ship`,
          crew: 10,
          cargo: [],
          durability: 30,
        },
      ],
    };
    fleetId += 1;
  }

  return {
    portId: character.startingPortId,
    buildingId: null,
    timePassed: START_TIME_PASSED,
    fleets: { '1': { position: undefined, ships: [] }, ...npcFleets },
    dayAtSea: 0,
    gold: character.startingGold,
    quests: [],
    usedShipsAtPort: {},
    savings: 0,
    debt: character.startingDebt,
    items: [],
    mates: [{ sailorId: character.sailorId, role: null }],
  };
}
