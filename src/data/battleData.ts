// Battle system data — extracted from SNES ROM analysis + UWNH game documentation
// Sea battle and captain duel mechanics for Uncharted Waters: New Horizons

export type BattleDistance = 'far' | 'medium' | 'close' | 'boarding';

// ─── Cannon Types ────────────────────────────────────────────────────────────
// ROM-confirmed names from SNES ROM offset 0xB0A40:
// Cannon, Demi-cannon, Canon Pedrero, Culverin, Demi-culverin, Saker, Carronade
// Power: base damage per cannon per volley (1-20 scale)

export interface CannonType {
  id: string;
  name: string;
  power: number;         // base damage per gun (1-20 scale)
  optimalRange: BattleDistance[];  // distances where this cannon is most effective
  powerByRange: Record<BattleDistance, number>;  // power multiplier at each range
  hitChanceBonus: number;   // flat bonus to hit % (negative = penalty)
  cost: number;          // cost per cannon unit
}

export const cannonTypes: Record<string, CannonType> = {
  // Saker — light, short-range, fast reload. Best for small ships and pirates.
  saker: {
    id: 'saker',
    name: 'Saker',
    power: 4,
    optimalRange: ['close'],
    powerByRange: { far: 0, medium: 0.5, close: 1.0, boarding: 1.2 },
    hitChanceBonus: 5,
    cost: 50,
  },
  // Cannon — standard broadside gun. Effective at medium-close range.
  cannon: {
    id: 'cannon',
    name: 'Cannon',
    power: 8,
    optimalRange: ['close', 'medium'],
    powerByRange: { far: 0.3, medium: 0.8, close: 1.0, boarding: 0.6 },
    hitChanceBonus: 0,
    cost: 150,
  },
  // Demi-cannon — heavier than cannon, harder to aim, solid medium-range punch.
  demi_cannon: {
    id: 'demi_cannon',
    name: 'Demi-cannon',
    power: 10,
    optimalRange: ['medium'],
    powerByRange: { far: 0.5, medium: 1.0, close: 0.7, boarding: 0 },
    hitChanceBonus: -5,
    cost: 200,
  },
  // Demi-culverin — between saker and culverin. Good reach, moderate power.
  demi_culverin: {
    id: 'demi_culverin',
    name: 'Demi-culverin',
    power: 6,
    optimalRange: ['far', 'medium'],
    powerByRange: { far: 0.7, medium: 1.0, close: 0.4, boarding: 0 },
    hitChanceBonus: -5,
    cost: 180,
  },
  // Culverin — long-range artillery. Excellent at far range, poor close-up.
  culverin: {
    id: 'culverin',
    name: 'Culverin',
    power: 7,
    optimalRange: ['far', 'medium'],
    powerByRange: { far: 1.0, medium: 0.8, close: 0.3, boarding: 0 },
    hitChanceBonus: -10,
    cost: 250,
  },
  // Canon Pedrero — stone-shot cannon. Area effect, close-to-medium range.
  canon_pedrero: {
    id: 'canon_pedrero',
    name: 'Canon Pedrero',
    power: 9,
    optimalRange: ['close', 'medium'],
    powerByRange: { far: 0.1, medium: 0.7, close: 1.0, boarding: 0.9 },
    hitChanceBonus: 8,
    cost: 220,
  },
  // Carronade — short naval gun, devastating at close range and boarding.
  carronade: {
    id: 'carronade',
    name: 'Carronade',
    power: 18,
    optimalRange: ['close'],
    powerByRange: { far: 0, medium: 0.2, close: 1.0, boarding: 0.8 },
    hitChanceBonus: 10,
    cost: 400,
  },
};

// Default cannon type for enemy ships
export const DEFAULT_CANNON_TYPE = 'cannon';

// ─── Formation Types ──────────────────────────────────────────────────────────
// Formations apply bonuses/penalties to attack and defense

export interface Formation {
  id: string;
  name: string;
  attackBonus: number;    // multiplier to outgoing damage (1.0 = no change)
  defenseBonus: number;   // multiplier to incoming damage (lower = better defense)
  speedBonus: number;     // bonus to escape/chase checks (0-20)
  description: string;
}

export const formations: Record<string, Formation> = {
  line: {
    id: 'line',
    name: 'Line Abreast',
    attackBonus: 1.3,
    defenseBonus: 1.0,
    speedBonus: 0,
    description: 'Ships line up broadside. Maximum firepower.',
  },
  wedge: {
    id: 'wedge',
    name: 'Wedge',
    attackBonus: 1.1,
    defenseBonus: 0.9,
    speedBonus: 5,
    description: 'V-formation for charging. Good balance of speed and attack.',
  },
  scatter: {
    id: 'scatter',
    name: 'Scatter',
    attackBonus: 0.8,
    defenseBonus: 0.7,
    speedBonus: 10,
    description: 'Ships spread out. Hard to hit, good for escaping.',
  },
  column: {
    id: 'column',
    name: 'Column',
    attackBonus: 0.9,
    defenseBonus: 0.8,
    speedBonus: 8,
    description: 'Single file for maximum speed through narrow straits.',
  },
};

export const DEFAULT_FORMATION = 'line';

// ─── Distance Modifiers ────────────────────────────────────────────────────
// How distance affects combat

export interface DistanceInfo {
  label: string;
  description: string;
  crewAttackBonus: number;  // boarding actions at this range
  canEscape: boolean;       // can player attempt escape?
  escapeChanceMod: number;  // modifier to escape chance
}

export const distanceInfo: Record<BattleDistance, DistanceInfo> = {
  far: {
    label: 'Long Range',
    description: 'Ships are far apart. Only long-range cannons effective.',
    crewAttackBonus: 0,
    canEscape: true,
    escapeChanceMod: 1.5,
  },
  medium: {
    label: 'Medium Range',
    description: 'Standard cannon range. All cannons can fire.',
    crewAttackBonus: 0,
    canEscape: true,
    escapeChanceMod: 1.0,
  },
  close: {
    label: 'Close Range',
    description: 'Close quarters! Short-range weapons most effective.',
    crewAttackBonus: 0.2,
    canEscape: false,
    escapeChanceMod: 0.5,
  },
  boarding: {
    label: 'Boarding!',
    description: 'Crew fighting on deck. Cannons useless. Leadership decides!',
    crewAttackBonus: 1.0,
    canEscape: false,
    escapeChanceMod: 0.2,
  },
};

// ─── Battle Constants ───────────────────────────────────────────────────────

export const BATTLE_CONSTANTS = {
  // Base hit chance before leadership/stats modifier (percentage 0-100)
  BASE_HIT_CHANCE: 40,

  // Leadership contribution to hit chance (per leadership point above 50)
  LEADERSHIP_HIT_BONUS: 0.5,

  // Gunnery skill multiplier to hit chance (from sailor skills)
  GUNNERY_HIT_BONUS: 15,

  // Morale impact on damage output (at 50% morale, deal 75% damage)
  MORALE_DAMAGE_FACTOR: 0.5,

  // Morale loss per 10% hull damage taken
  MORALE_LOSS_PER_DAMAGE: 15,

  // Crew efficiency: below this crew ratio, damage is reduced
  CREW_EFFICIENCY_THRESHOLD: 0.5,

  // Maximum morale
  MORALE_MAX: 100,

  // Morale at which ship surrenders
  MORALE_SURRENDER: 0,

  // Boarding damage base (per crew ratio advantage)
  BOARDING_CREW_DAMAGE: 20,

  // Distance change per turn based on speed difference
  // Positive = approaching, negative = retreating
  SPEED_TO_DISTANCE_CHANGE: 0.3,
} as const;

// ─── Enemy Fleet Presets ───────────────────────────────────────────────────
// Common enemy configurations encountered at sea

export type EnemyType = 'pirate' | 'corsair' | 'warship' | 'merchant' | 'rival';

export interface EnemyFleetPreset {
  type: EnemyType;
  name: string;
  shipIds: string[];         // from shipData keys
  cannonType: string;        // from cannonTypes keys
  formation: string;         // from formations keys
  captainName: string;
  captainStats: {
    leadership: number;
    seamanship: number;
    courage: number;
    swordplay: number;
    intuition: number;
  };
  lootGold: [number, number];     // [min, max] gold reward
  piracyFame: number;        // piracy fame earned for defeating
  canTriggerDuel: boolean;   // whether captain will challenge to duel
}

export const enemyFleetPresets: Record<EnemyType, EnemyFleetPreset> = {
  pirate: {
    type: 'pirate',
    name: 'Pirate Fleet',
    shipIds: ['8', '6'],  // Brigantine + Caravela Latina
    cannonType: 'saker',
    formation: 'wedge',
    captainName: 'Pirate Captain',
    captainStats: { leadership: 55, seamanship: 65, courage: 70, swordplay: 65, intuition: 50 },
    lootGold: [500, 2000],
    piracyFame: 15,
    canTriggerDuel: true,
  },
  corsair: {
    type: 'corsair',
    name: 'Corsair Fleet',
    shipIds: ['22', '6'],  // La Reale + Caravela Latina
    cannonType: 'cannon',
    formation: 'line',
    captainName: 'Corsair Captain',
    captainStats: { leadership: 65, seamanship: 70, courage: 75, swordplay: 70, intuition: 55 },
    lootGold: [1000, 4000],
    piracyFame: 25,
    canTriggerDuel: true,
  },
  warship: {
    type: 'warship',
    name: 'Naval Warship',
    shipIds: ['11', '15'],  // Galleon + Frigate
    cannonType: 'demi_cannon',
    formation: 'line',
    captainName: 'Naval Captain',
    captainStats: { leadership: 75, seamanship: 80, courage: 70, swordplay: 75, intuition: 65 },
    lootGold: [2000, 8000],
    piracyFame: 50,
    canTriggerDuel: true,
  },
  merchant: {
    type: 'merchant',
    name: 'Merchant Vessel',
    shipIds: ['9'],  // Nao
    cannonType: 'saker',
    formation: 'scatter',
    captainName: 'Merchant Captain',
    captainStats: { leadership: 40, seamanship: 55, courage: 45, swordplay: 40, intuition: 60 },
    lootGold: [1000, 6000],
    piracyFame: 10,
    canTriggerDuel: false,
  },
  rival: {
    type: 'rival',
    name: 'Rival Fleet',
    shipIds: ['10', '8'],  // Carrack + Brigantine
    cannonType: 'cannon',
    formation: 'wedge',
    captainName: 'Rival Captain',
    captainStats: { leadership: 70, seamanship: 72, courage: 68, swordplay: 72, intuition: 60 },
    lootGold: [1500, 5000],
    piracyFame: 30,
    canTriggerDuel: true,
  },
};

// ─── Captain Duel Data ──────────────────────────────────────────────────────
// ROM-authentic 6-move system from SNES ROM tutorial text (offset 0xEA5C6):
//   "Defensive: Parry against Thrust, Block against Lash, Dodge against Strike."
//   "Offensive: Strike against Parry, Lash against Dodge, Thrust against Block."
//
// Counter pairs (each move beats one and loses to one):
//   Thrust → beats Block,  loses to Parry
//   Lash   → beats Dodge,  loses to Block
//   Strike → beats Parry,  loses to Dodge
//   Parry  → beats Thrust, loses to Strike
//   Block  → beats Lash,   loses to Thrust
//   Dodge  → beats Strike, loses to Lash

export type DuelPhase = 'pistol' | 'sword';
export type DuelMove = 'thrust' | 'lash' | 'strike' | 'parry' | 'block' | 'dodge';
export type DuelMoveKind = 'offense' | 'defense';

export interface DuelMoveData {
  id: DuelMove;
  name: string;
  kind: DuelMoveKind;
  description: string;
  beats: DuelMove;       // this move wins against this opponent move
  losesTo: DuelMove;     // this move loses against this opponent move
  // Stat weights for damage when this move WINS the exchange:
  attackStatWeight: number;   // swordplay contribution (0-1)
  courageWeight: number;       // courage contribution (0-1)
}

export const duelMoves: Record<DuelMove, DuelMoveData> = {
  // ── Offensive moves ──────────────────────────────────────────────────────
  thrust: {
    id: 'thrust',
    name: 'Thrust',
    kind: 'offense',
    description: 'A direct lunge. Effective against Block.',
    beats: 'block',
    losesTo: 'parry',
    attackStatWeight: 0.7,
    courageWeight: 0.3,
  },
  lash: {
    id: 'lash',
    name: 'Lash',
    kind: 'offense',
    description: 'A sweeping cut. Catches those who Dodge.',
    beats: 'dodge',
    losesTo: 'block',
    attackStatWeight: 0.6,
    courageWeight: 0.4,
  },
  strike: {
    id: 'strike',
    name: 'Strike',
    kind: 'offense',
    description: 'A powerful blow. Breaks through Parry.',
    beats: 'parry',
    losesTo: 'dodge',
    attackStatWeight: 0.5,
    courageWeight: 0.5,
  },
  // ── Defensive moves ──────────────────────────────────────────────────────
  parry: {
    id: 'parry',
    name: 'Parry',
    kind: 'defense',
    description: 'Deflect a Thrust and riposte.',
    beats: 'thrust',
    losesTo: 'strike',
    attackStatWeight: 0.8,
    courageWeight: 0.2,
  },
  block: {
    id: 'block',
    name: 'Block',
    kind: 'defense',
    description: 'Absorb a Lash with your guard.',
    beats: 'lash',
    losesTo: 'thrust',
    attackStatWeight: 0.6,
    courageWeight: 0.4,
  },
  dodge: {
    id: 'dodge',
    name: 'Dodge',
    kind: 'defense',
    description: 'Step aside to avoid a Strike.',
    beats: 'strike',
    losesTo: 'lash',
    attackStatWeight: 0.5,
    courageWeight: 0.5,
  },
};

// Outcome of move vs move: 'win' | 'lose' | 'neutral'
export type DuelOutcome = 'win' | 'lose' | 'neutral';

export function getDuelOutcome(playerMove: DuelMove, enemyMove: DuelMove): DuelOutcome {
  const pm = duelMoves[playerMove];
  if (pm.beats === enemyMove) return 'win';
  if (pm.losesTo === enemyMove) return 'lose';
  return 'neutral';
}

export const DUEL_CONSTANTS = {
  STARTING_HP: 100,
  // Damage on a winning exchange (base before stat scaling)
  WIN_BASE_DAMAGE: 25,
  // Damage on a neutral exchange (both land glancing blows)
  NEUTRAL_DAMAGE: 8,
  // Swordplay contributes this much to final damage (0-1)
  SWORDPLAY_DAMAGE_WEIGHT: 0.6,
  COURAGE_DAMAGE_WEIGHT: 0.4,
  // Random variance on each damage roll: final × [1 - VARIANCE, 1 + VARIANCE]
  DAMAGE_VARIANCE: 0.25,
  // Pistol phase
  PISTOL_LEADERSHIP_WEIGHT: 0.7,
  PISTOL_INTUITION_WEIGHT: 0.3,
  PISTOL_DAMAGE: 30,
  PISTOL_HIT_CHANCE: 0.5,
  LUCK_RNG_FACTOR: 0.3,
} as const;
