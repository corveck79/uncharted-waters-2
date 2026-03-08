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
    age: 26,
    stats: {
      leadership: 85,
      seamanship: 80,
      knowledge: 70,
      intuition: 75,
      courage: 92,
      swordplay: 90,
      charm: 72,
      luck: 60,
    },
    navigationLevel: 3,
    battleLevel: 5,
    skills: ['Gunnery'],
  },
  '3': {
    name: 'Catalina Erantzo',
    age: 22,
    stats: {
      leadership: 80,
      seamanship: 85,
      knowledge: 68,
      intuition: 88,
      courage: 90,
      swordplay: 88,
      charm: 80,
      luck: 75,
    },
    navigationLevel: 2,
    battleLevel: 4,
    skills: ['Gunnery'],
  },
  '4': {
    name: 'Ernst von Bohr',
    age: 32,
    stats: {
      leadership: 72,
      seamanship: 70,
      knowledge: 95,
      intuition: 80,
      courage: 65,
      swordplay: 60,
      charm: 75,
      luck: 55,
    },
    navigationLevel: 5,
    battleLevel: 1,
    skills: ['Celestial Navigation', 'Cartography'],
  },
  '5': {
    name: 'Pietro Conti',
    age: 28,
    stats: {
      leadership: 75,
      seamanship: 72,
      knowledge: 78,
      intuition: 82,
      courage: 78,
      swordplay: 72,
      charm: 92,
      luck: 80,
    },
    navigationLevel: 2,
    battleLevel: 2,
    skills: ['Negotiation'],
  },
  '6': {
    name: 'Ali Vezas',
    age: 30,
    stats: {
      leadership: 76,
      seamanship: 78,
      knowledge: 80,
      intuition: 85,
      courage: 74,
      swordplay: 70,
      charm: 88,
      luck: 65,
    },
    navigationLevel: 3,
    battleLevel: 2,
    skills: ['Accounting', 'Negotiation'],
  },
};

const getSailor = (id: string) => sailorData[id];

export default getSailor;
