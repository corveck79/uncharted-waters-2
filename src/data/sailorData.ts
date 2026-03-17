export const sailorSkills = [
  'Celestial Navigation',
  'Accounting',
  'Negotiation',
  'Gunnery',
  'Cartography',
] as const;
export type SailorSkills = typeof sailorSkills[number];

export type Sailor = {
  name: string;
  age: number;
  stats: {
    leadership: number;
    seamanship: number;
    knowledge: number;
    intuition: number;
    courage: number;
    swordplay: number;
    charm: number;
    luck: number;
  };
  navigationLevel: number;
  battleLevel: number;
  skills: SailorSkills[];
};

const sailorData: { [key: string]: Sailor } = {
  '1': {
    name: 'João Franco',
    age: 18,
    stats: {
      leadership: 78,
      seamanship: 75,
      knowledge: 73,
      intuition: 85,
      courage: 82,
      swordplay: 82,
      charm: 89,
      luck: 50,
    },
    navigationLevel: 1,
    battleLevel: 1,
    skills: ['Negotiation'],
  },
  '32': {
    name: 'Rocco Alemkel',
    age: 65,
    stats: {
      leadership: 75,
      seamanship: 82,
      knowledge: 84,
      intuition: 90,
      courage: 93,
      swordplay: 92,
      charm: 70,
      luck: 70,
    },
    navigationLevel: 30,
    battleLevel: 32,
    skills: ['Celestial Navigation', 'Gunnery'],
  },
  '34': {
    name: 'Matthew Roy',
    age: 30,
    stats: {
      leadership: 78,
      seamanship: 88,
      knowledge: 65,
      intuition: 72,
      courage: 95,
      swordplay: 90,
      charm: 68,
      luck: 75,
    },
    navigationLevel: 20,
    battleLevel: 28,
    skills: ['Gunnery', 'Celestial Navigation'],
  },
  '33': {
    name: 'Enrico Malione',
    age: 24,
    stats: {
      leadership: 66,
      seamanship: 48,
      knowledge: 93,
      intuition: 55,
      courage: 62,
      swordplay: 48,
      charm: 82,
      luck: 100,
    },
    navigationLevel: 1,
    battleLevel: 1,
    skills: ['Accounting'],
  },
  '2': {
    name: 'Otto Baynes',
    age: 25,
    stats: {
      leadership: 92,
      seamanship: 72,
      knowledge: 61,
      intuition: 43,
      courage: 88,
      swordplay: 86,
      charm: 82,
      luck: 50,
    },
    navigationLevel: 10,
    battleLevel: 12,
    skills: ['Gunnery'],
  },
  '3': {
    name: 'Catalina Erantzo',
    age: 18,
    stats: {
      leadership: 80,
      seamanship: 79,
      knowledge: 65,
      intuition: 52,
      courage: 86,
      swordplay: 92,
      charm: 95,
      luck: 50,
    },
    navigationLevel: 8,
    battleLevel: 10,
    skills: ['Gunnery'],
  },
  '4': {
    name: 'Ernst von Bohr',
    age: 23,
    stats: {
      leadership: 78,
      seamanship: 92,
      knowledge: 86,
      intuition: 82,
      courage: 62,
      swordplay: 53,
      charm: 90,
      luck: 50,
    },
    navigationLevel: 11,
    battleLevel: 1,
    skills: ['Celestial Navigation', 'Cartography'],
  },
  '5': {
    name: 'Pietro Conti',
    age: 33,
    stats: {
      leadership: 84,
      seamanship: 80,
      knowledge: 75,
      intuition: 87,
      courage: 53,
      swordplay: 61,
      charm: 81,
      luck: 50,
    },
    navigationLevel: 4,
    battleLevel: 1,
    skills: ['Negotiation'],
  },
  '6': {
    name: 'Ali Vezas',
    age: 19,
    stats: {
      leadership: 80,
      seamanship: 86,
      knowledge: 84,
      intuition: 65,
      courage: 53,
      swordplay: 42,
      charm: 80,
      luck: 50,
    },
    navigationLevel: 1,
    battleLevel: 1,
    skills: ['Accounting', 'Negotiation'],
  },
  '35': {
    name: 'Emilio Sanude',
    age: 30,
    stats: {
      leadership: 68,
      seamanship: 88,
      knowledge: 74,
      intuition: 70,
      courage: 92,
      swordplay: 90,
      charm: 72,
      luck: 68,
    },
    navigationLevel: 8,
    battleLevel: 11,
    skills: ['Gunnery', 'Celestial Navigation'],
  },
  '36': {
    name: 'Paula van Buren',
    age: 21,
    stats: {
      leadership: 60,
      seamanship: 78,
      knowledge: 92,
      intuition: 88,
      courage: 62,
      swordplay: 45,
      charm: 80,
      luck: 65,
    },
    navigationLevel: 18,
    battleLevel: 1,
    skills: ['Celestial Navigation', 'Cartography'],
  },
  '37': {
    name: 'Camillo Stefano',
    age: 34,
    stats: {
      leadership: 65,
      seamanship: 72,
      knowledge: 80,
      intuition: 76,
      courage: 60,
      swordplay: 55,
      charm: 85,
      luck: 78,
    },
    navigationLevel: 3,
    battleLevel: 2,
    skills: ['Celestial Navigation', 'Accounting'],
  },
  '38': {
    name: 'Salim',
    age: 19,
    stats: {
      leadership: 62,
      seamanship: 78,
      knowledge: 70,
      intuition: 68,
      courage: 82,
      swordplay: 75,
      charm: 65,
      luck: 72,
    },
    navigationLevel: 3,
    battleLevel: 7,
    skills: ['Celestial Navigation', 'Gunnery'],
  },
  '40': {
    name: 'Hans Brugman',
    age: 28,
    stats: {
      leadership: 65,
      seamanship: 70,
      knowledge: 55,
      intuition: 62,
      courage: 88,
      swordplay: 82,
      charm: 55,
      luck: 70,
    },
    navigationLevel: 2,
    battleLevel: 8,
    skills: ['Gunnery'],
  },
};

const getSailor = (id: string) => sailorData[id];

export default getSailor;
