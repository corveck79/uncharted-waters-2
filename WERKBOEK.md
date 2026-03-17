# UW2 Remake — Werkboek voor Claude

> Lees dit aan het begin van elke sessie. Bevat alle technische kennis die anders verloren gaat.

---

## 1. Project op een rij

| | |
|---|---|
| **Repo** | `P:/Uncharted_Waters_2` (branch: `dev`) |
| **Live** | https://johan.li/uncharted-waters-2/ |
| **Dev server** | `npm run dev` → poort 3000 (via Claude Preview "dev") |
| **Stack** | TypeScript, React 18, Canvas 2D, localStorage saves |
| **Eigenaar** | Sjack (Johan Li) — het is zijn eigen game/portfolio project |

---

## 2. Kritische kennis: CHAR-bestanden

### Werkelijke inhoud (bestandsnamen KLOPPEN NIET!)

| Bestand in `char_raw/` | Decoded naam (misleidend!) | Werkelijke inhoud |
|---|---|---|
| `CHAR.000` | `CHAR000_player_strip.png` | João (PLAYER) |
| `CHAR.001` | `CHAR001_woman_strip.png` | **Catalina Erantzo** |
| `CHAR.002` | `CHAR002_man_strip.png` | **Otto Baynes** |
| `CHAR.003` | `CHAR003_merchant_strip.png` | **Ernst von Bohr** |
| `CHAR.004` | `CHAR004_dog_strip.png` | **Pietro Conti** |
| `CHAR.005` | `CHAR005_guard_strip.png` | **Ali Vezas** |
| `CHAR.006` | `CHAR006_sailors_strip.png` | **Port NPC's** (woman/man/merchant/dog/guard/beggar) |

**Let op:** De decoded bestanden staan in `P:/Uncharted_Waters_2/work/char_decoded/`
**Raw binaries:** `P:/Uncharted_Waters_2/work/char_raw/`

### CHAR006 interne layout (Port NPC's, 24 frames × 32px = 768px)

| Frames | NPC type | Frames in portCharacters |
|---|---|---|
| 0–7 | WOMAN (loopt) | pos 8–15 |
| 8–15 | MAN (loopt) | pos 16–23 |
| 16–17 | MERCHANT (statisch) | pos 24–25 |
| 18–19 | DOG (statisch) | pos 26–27 |
| 20–21 | GUARD (statisch) | pos 28–29 |
| 22–23 | BEGGAR (statisch) | pos 30–31 |

---

## 3. portCharacters.png — volledige layout

**Bestand:** `P:/Uncharted_Waters_2/src/game/images/portCharacters.png`
**Formaat:** 2304 × 32px RGBA, 72 frames van 32px breed

| Frame pos | Type | Bron |
|---|---|---|
| 0–7 | PLAYER (João) | CHAR000, frames 0–7 |
| 8–15 | WOMAN NPC | CHAR006, frames 0–7 |
| 16–23 | MAN NPC | CHAR006, frames 8–15 |
| 24–25 | MERCHANT | CHAR006, frames 16–17 |
| 26–27 | DOG | CHAR006, frames 18–19 |
| 28–29 | GUARD | CHAR006, frames 20–21 |
| 30–31 | BEGGAR | CHAR006, frames 22–23 |
| 32–39 | OTTO (sailor 2) | CHAR002, frames 0–7 |
| 40–47 | ERNST (sailor 4) | CHAR003, frames 0–7 |
| 48–55 | PIETRO (sailor 5) | CHAR004, frames 0–7 |
| 56–63 | CATALINA (sailor 3) | CHAR001, frames 0–7 |
| 64–71 | ALI (sailor 6) | CHAR005, frames 0–7 |

**Walk-frame volgorde per slot:** `s1, s2, n1, n2, e1, e2, w1, w2`
(south×2, north×2, east×2, west×2)

**Build script:** `P:/Uncharted_Waters_2/work/build_portcharacters_fresh.py`
→ Bouwt de PNG helemaal opnieuw vanuit de bronbestanden. Altijd dit script gebruiken, nooit handmatig patchen.

---

## 4. Sailor → portCharacter mapping (in code)

In `portCharacters.ts`:
```typescript
const SAILOR_TO_PORT_TYPE = {
  '2': 'OTTO',      // Otto Baynes
  '3': 'CATALINA',  // Catalina Erantzo
  '4': 'ERNST',     // Ernst von Bohr
  '5': 'PIETRO',    // Pietro Conti
  '6': 'ALI',       // Ali Vezas
  // '1' → fallback 'PLAYER' (João)
};
```

In `portCharactersData.ts`:
```typescript
const SAILOR_TYPE_START_FRAMES = {
  'OTTO': 32, 'ERNST': 40, 'PIETRO': 48, 'CATALINA': 56, 'ALI': 64
};
```

Frame berekening (in `sharedUtils.ts`):
```
sourceX = character.frame() * character.width * TILE_SIZE
        = frame * 2 * 32 = frame * 64px  (op 2x canvas)
```

---

## 5. Spelerspersonages

| sailorId | Naam | Nationaliteit | Startport | Goud | Schuld | Quest |
|---|---|---|---|---|---|---|
| 1 | João Franco | Portugal | Lissabon (1) | 1000 | 0 | Atlantis ontdekken |
| 2 | Otto Baynes | England | port 30 | 1500 | 0 | Spaanse vloot verslaan |
| 3 | Catalina Erantzo | Spanje | port 4 | 800 | 0 | Wraak op Portugal |
| 4 | Ernst von Bohr | Holland | port 34 | 2000 | 0 | De wereld in kaart brengen |
| 5 | Pietro Conti | Italië | port 9 | 500 | 5000 | Schat vinden |
| 6 | Ali Vezas | Ottomaans | port 3 | 1200 | 0 | Handelsfortuin opbouwen |

---

## 6. Geïmplementeerde systemen (volledig)

### Wereld (canvas)
- Zeilen met wind/stroom simulatie
- NPC-vloten met goal-directed pathfinding
- Dag/nacht cyclus

### Haven (canvas + React)
| Gebouw | Status | Opmerkingen |
|---|---|---|
| Markt | ✅ volledig | Kopen/verkopen, invest, marktkoersen |
| Herberg/Pub | ✅ volledig | Bemanning rekruteren, karakter-interacties |
| Scheepswerf | ✅ volledig | Schepen kopen, remodel (kanon/bemanning), invest |
| Haven | ✅ volledig | Vlootbeheer, supplies |
| Paleis | ✅ volledig | Heerser ontmoeten, overlopen, schip/goud beloning |
| Herberg/Lodge | ✅ volledig | Rusten, spel opslaan |
| Kerk | ✅ volledig | Quest-dialoog (Enrico rekrutering) |
| Winkel | ✅ volledig | Items kopen, afdingen |
| Bank | ✅ volledig | Sparen, schuld aflossen |
| Gilde | ✅ volledig | Job Assignment (discovery quests), Quest Report, Country Info |
| Waarzegger | ✅ volledig | Leven/carrière/liefde readings |

### Quest systeem
- Declaratief message-systeem met branching (`questData.ts`)
- João's complete openingssequentie geïmplementeerd
- Template variabelen: `$firstName`, `$lastName`

### Overig
- Save/load via localStorage (3 slots)
- Service worker (offline spelen)
- Port blockade (guards ipv normale NPC's)
- Nationaliteit/overlopen mechanic
- Investeren in haven economie/industrie

---

## 7. Nog NIET geïmplementeerd (kandidaten volgende fase)

- ✅ **Zeegevecht** — geïmplementeerd! (zie hieronder)
- ✅ **Navigatie/astrolabe** — Chart.tsx volledig (zie §14)
- ✅ **Gilde** — avonturiersquests geïmplementeerd (zie §14)
- ✅ **Fame-bijschrijfsysteem** — alle drie paden werken + localStorage persistentie
- ✅ **Hans Starten** — Ernst's companion is nu Hans Brugman (sailorId '40'), niet Paula
- ✅ **Port siege/belegering** — geïmplementeerd (zie §15)
- ✅ **Port Map** — geïmplementeerd (PortMap.tsx, RightTabs Info-tab)
- ✅ **Late-game finales** — João, Catalina, Ernst afgerond (zie §16); Otto/Pietro/Ali hadden al finales
- ✅ **Port data update** — alle 58 ports met item shops bijgewerkt vanuit originele game data (2026-03-13)
- ✅ **Navigation → Port Call** — toegevoegd (2026-03-13): toont alle havens gesorteerd op afstand, docks direct via dock()
- ✅ **Ships per port** — geïmplementeerd (2026-03-13): alle 100 havens `ships: []` in portData.ts; `getNewShipsAvailable()` gebruikt per-port lijst i.p.v. industryId groep
- ✅ **Markt per-port prijzen** — geïmplementeerd (2026-03-13): `portGoodsData.ts` met echte prijzen voor alle 100 havens; `getBuyPrice()` gebruikt per-port prijs als eerste, formule als fallback
- ✅ **Auto Sail** — geïmplementeerd (2026-03-13): NAV → Auto Sail toont haven-lijst gesorteerd op afstand; `bestDirection()` stuurt het schip automatisch; handmatig sturen cancelt; auto-docks bij aankomst. Bug fix: speler startschip (Caravela Latina) wordt nu aangemaakt in `getStartingState()`.
- ⚪ **Meer sprite-extractie** — eventuele gevechts-sprites, FACE-bestanden

### RightTabs ContentPanels (geïmplementeerd sessie 2026-03-12)

Alle 5 eerder-stubbed panelen zijn functioneel:

| Panel | Tab | Inhoud |
|---|---|---|
| ShipInfoPanel | Fleet → Ship Info | Type, materiaal, durability%, crew, guns, tacking, power, cargo |
| CargoInfoPanel | Fleet → Cargo Info | Provisions (food/water/lumber/shot) + handelsgoeds met naam |
| WagesPanel | Crew → Wages | Per-mate dagloon (10 gold), dagelijks/maandelijks totaal |
| JobDutyPanel | Crew → Change Job Duty | First mate kiezen met confirm-scherm; `setFirstMate()` call |
| RationsPanel | Crew → Rations | Kleurgecodeerde dagenteller (goud≥30, oranje≥10, rood<10) per schip |

### Pub/Haven volledig geïmplementeerd (sessie 2026-03-12)

**Pub.tsx** — alle 6 opties actief:
- **Recruit Crew** — was al werkend
- **Dismiss Crew** — berekent excess crew per `shipData.minimumCrew`, `dismissCrew()` action
- **Treat** — 50 gold → `treatCrew(50)` (+60 minuten game-tijd)
- **Meet** — flavor tekst "nobody of particular interest"
- **Waitress** — Lisbon vs. andere haven flavor
- **Gamble** — 100 gold, 50/50 dobbelstenen, `gambleGold()` action

**Harbor.tsx** — Moor geïmplementeerd:
- First mate bevestiging → `checkIn()` (zet tijd door naar volgende ochtend)

**Nieuwe actionsPort.ts functies:** `dismissCrew()`, `treatCrew(cost)`, `gambleGold(amount, won)`

**Unicode-valkuil opgelost:** Pub.tsx had U+2018/U+2019 curly quotes als string-delimiters → Babel parse error. Fix: alle 8 instances vervangen door rechte apostroffen.

### Zeegevecht systeem (geïmplementeerd sessie 2025-03-12)

**Bestanden:**
- `src/data/battleData.ts` — kanonnen, formaties, afstanden, vijandpresets, duel moves
- `src/game/world/seaBattle.ts` — pure battle logica (initBattle, resolveTurn, duel)
- `src/state/actionsBattle.ts` — state mutations (startBattle, battleAction, duelAction, endBattle)
- `src/interface/battle/SeaBattle.tsx` — zeegevecht UI overlay
- `src/interface/battle/CaptainDuel.tsx` — kapiteinsduel UI

**Trigger:** NPC-vloot binnen 2 tiles → `startBattle(enemyType)` in worldCharacters.ts

**Gevechtsflow:**
1. `state.battle !== null` → SeaBattle overlay toont over de wereld
2. Speler kiest: Fire Cannons / Charge (of Board op 'boarding' afstand) / Escape
3. Vijand AI reageert automatisch (strategie per vijandtype)
4. Hull + morale dalen → bij 0 of surrender: victory/defeat
5. Na overwinning: 65% kans op kapiteinsduel (`canTriggerDuel=true` vijanden)
6. Duel: pistolfase → zwaardgevecht → winst/verlies

**Loot/gevolgen:**
- Victory: lootGold wordt toegevoegd aan state.gold, piracyFame stijgt
- Defeat: flagship durability gehalveerd, crew losses gesynchroniseerd
- Escape: telt als victory zonder loot

---

## 8. Bestandsstructuur (kort)

```
src/
├── data/           ← alle speldata (schepen, havens, items, karakters)
├── state/          ← state.ts, selectors.ts, actionsPort.ts, actionsWorld.ts
├── game/
│   ├── images/     ← portCharacters.png, worldTileset.png, portTilesets.png, worldShips.png
│   ├── port/       ← port.ts, portPlayer.ts, portCharacters.ts, portNpc.ts
│   └── world/      ← world.ts, worldPlayer.ts, worldCharacters.ts, fleets.ts
├── interface/
│   ├── images/     ← characters.png (8192×80!), items.png, ships.png, buildings.png
│   └── port/       ← alle gebouwcomponenten (Building.tsx router + per gebouw)
└── app.ts          ← entry point
```

---

## 9. Veelgemaakte fouten (valkuilen)

1. **CHAR bestandsnamen vertrouwen** — de namen (`woman`, `man`, etc.) kloppen NIET met de inhoud
2. **portCharacters.png patchen** — altijd `build_portcharacters_fresh.py` gebruiken, nooit handmatig
3. **Frame berekening** — canvas is 2x upscaled, dus `frame * 64px` niet `frame * 32px`
4. **STATIONARY_FROM_I = 3** in portCharactersData — MERCHANT t/m BEGGAR krijgen 2 frames, maar de getStartFrame() formule is subtiel: frames overlappen in het PNG-slot (geen conflict want ze lezen maar 2 frames)
5. **sailorId vs portCharacterType** — sailorId is een string ('2'), de mapping zit in portCharacters.ts niet in portCharactersData.ts

---

## 10. ROM-analyse resultaten (SNES Uncharted Waters: New Horizons (U))

### ROM-bestand
`The_Original_UWS_SNES_ROM/Uncharted Waters - New Horizons (U).smc`
SNES HiROM met 512-byte SMC header. Alle offsets inclusief header.

### Schepenstats volledig gedecoded (s4) — 275/275 checks geslaagd

**Scheepsnamentabel:** `0x8CDB0`, records van 25 bytes (6-byte header + 19-byte naam met null-padding), 25 schepen (1-based index i=1..25)

**Scheepsstattabel:** `0x8D023`, records van 12 bytes, 25 schepen

**Toegangsformules (1-based scheepsindex i=1..25):**

```python
STATS_TABLE = 0x8D023
SHIP_TABLE  = 0x8CDB0

# Directe velden (record i-1, 0-based):
ind[i]   = ROM[STATS_TABLE + (i-1)*12 + 4] * 10
dur[i]   = ROM[STATS_TABLE + (i-1)*12 + 5]
tack[i]  = ROM[STATS_TABLE + (i-1)*12 + 6]
pow[i]   = ROM[STATS_TABLE + (i-1)*12 + 7]
maxC[i]  = ROM[STATS_TABLE + (i-1)*12 + 8] * 10
minC[i]  = ROM[STATS_TABLE + (i-1)*12 + 9]
cap[i]   = ROM[STATS_TABLE + (i-1)*12 + 10] + ROM[STATS_TABLE + (i-1)*12 + 11]*256  # LE16

# Offset-by-one velden (record i, 1-based — schip i's data staat in het VOLGENDE record):
maxG[i]  = ROM[STATS_TABLE + i*12]                                           # byte 0 van record i
price[i] = (ROM[STATS_TABLE + i*12 + 2] + ROM[STATS_TABLE + i*12 + 3]*256) * 10  # LE16 × 10

# Speciale velden (in namentabel of prefix bytes):
gU[i]    = ROM[SHIP_TABLE + i*25 + 1]          # i=1..24
gU[25]   = ROM[0x8D022]                         # prefix byte vóór STATS_TABLE
cU[i]    = ROM[SHIP_TABLE + i*25 + 2] + ROM[SHIP_TABLE + i*25 + 3]*256  # LE16, i=1..24
cU[25]   = ROM[STATS_TABLE] + ROM[STATS_TABLE+1]*256                     # LE16 = start stats table
```

**Belangrijke patronen:**
- **Offset-by-one:** maxG en price van schip i staan in record i (1-based), niet in record i-1
- **Prefix bytes:** ROM[0x8D021..0x8D022] = [flags, gU_van_schip25] — direct vóór de stats tabel
- **gU/cU overlap:** gU en cU van schip 25 (Kansen) overlappen fysiek met het begin van de stats tabel

**Onbekende velden (niet player-visible, overgeslagen):**
- `stats[i][1]` — waarden 0-5, waarschijnlijk intern scheepstype of sprite-index
- `header[i][4:6]` — 2-byte waarden, geen match gevonden met bekende stats

### Status TypeScript-data
- `src/data/shipData.ts` — alle 25 schepen × 11 velden ROM-geverifieerd correct. Geen wijzigingen nodig.
- Verificatiescript: `work/rom_analysis/s4_verify_all.py` (275/275 pass)

### Discovery/landmark data geanalyseerd

**Namen-tabel:** ROM offset `0x0EF475–0x0EF940` (na SMC header), 98 null-terminated ASCII strings
**Beschrijvingen-tabel:** ROM offset `0x0EC000–0x0EF475`, null-terminated ASCII strings
**Escape-reeks voor lange namen:** `0x1B 0x44 [tekst] 0x1B 0x55` = twee-regel weergave

**ROM vs. discoveryData.ts:**
- ROM bevat **98 namen**, TS bevatte **78 discoveries**
- **22 discoveries toegevoegd** (ids 79–100) in sessie 2026-03-12: Baobab, Moonbow, Quagga, Dodo, Papyrus, Panda, Cactus, Iguana, Balsa, Piranha, Toucan, Bison, Python, Koala, Kiwi, Durian, Moa, Aurora, Indo-Pacific Cowrie, Nasiped, Ayutthaya's Buddha, Mural of Marnalico
- **3 ROM-namen al aanwezig** onder andere naam: Tasmanian Devil (id:66), Woolly Mammoth (id:74), Easter Island Statue/Moai (id:78)
- **discoveryData.ts bevat nu 100 entries** (ids 1–100)
- Coördinaten voor de nieuwe entries zijn **geografisch geschat** (geen ROM-coördinaattabel gevonden)

**NIET gevonden in ROM:**
- Coördinaten-tabel (worldX/worldY zijn handmatig ingesteld in de remake)
- Fame/reward-tabel (adventureFame-waarden zijn handmatig ingesteld)

**Analyse scripts:**
- `work/rom_analysis/rom_extract_discoveries.py` — hoofdscript
- `work/rom_analysis/output/discoveries_raw.txt` — volledige output
- `work/rom_analysis/output/discoveries_summary.txt` — samenvatting

### Sailor roster volledig gedecoded — `src/data/sailorData.ts` bijgewerkt

**Roster locatie:** ROM offset `0x0881F3`, 50-byte vaste records, 6 hoofd-matrozen
**Record layout (0-based bytes):** `[0..12]` voornaam, `[13..25]` achternaam, `[26]` sailor_id, `[28..35]` 8 stats, `[36]` nav_level, `[37]` battle_level, `[42]` leeftijd

**ROM-authentieke waarden (na verificatie):**
| ID | Naam | Match status |
|---|---|---|
| 1 | João Franco | ALL MATCH (stats 8/8, age 18, nav 1, battle 1) |
| 2 | Otto Baynes | BIJGEWERKT: age 26→25, stats/nav/battle gecorrigeerd |
| 3 | Catalina Erantzo | BIJGEWERKT: age 22→18, stats/nav/battle gecorrigeerd |
| 4 | Ernst von Bohr | BIJGEWERKT: age 32→23, stats/nav/battle gecorrigeerd |
| 5 | Pietro Conti | BIJGEWERKT: age 28→33, stats/nav/battle gecorrigeerd |
| 6 | Ali Vezas | BIJGEWERKT: age 30→19, stats/nav/battle gecorrigeerd |
| 32 | Rocco Alemkel | ALL MATCH (stats 8/8, age 65, nav 30, battle 32) |
| 33 | Enrico Malione | ALL MATCH (stats 8/8, age 24, nav 1, battle 1) |

**Analyse scripts:** `work/rom_analysis/final_analysis.py`, output: `work/rom_analysis/output/sailors_comparison.txt`

### Zeegevecht & Kapiteinsduel ROM-analyse (s8/s9) — 2026-03-12

**Output bestanden:**
- `work/rom_analysis/output/battle_strings.txt` — alle gevechts- en duelteksten
- `work/rom_analysis/output/battle_analysis.txt` — duel matrix + wapens + data-vergelijking
- `work/rom_analysis/s8_battle_final.py` — productiescript zeegevecht strings
- `work/rom_analysis/s9_duel_final.py` — productiescript kapiteinsduel analyse

**Battle menu strings (UI):**
- `0x1f53d` — Flee, Fight Back, Gather, Spread Out, Chase, Defend, At-tack, Es-cape, Fire, Rush, Support, Delegate
- `0x1f644` — "Change your plan." + alle order-namen in plain ASCII
- `0x1f69e` — Attack, Escape, Fire, Rush, Support, Enemy, Delegate

**Kanontypen (0xb0a40):** [0] empty, [1] Cannon, [2] Demi-cannon, [3] Canon Pedrero, [4] Culverin, [5] Demi-culverin, [6] Saker, [7] Carronade. De tabel herhaalt tweemaal (twee UI-contexten).

**Bemanningsrangen (0xb0b7f):** Commodore, Captain, First Mate, Bookkeeper, Chief Navigator, Navigator

**Wapennamen (0xb26a4):** [0] Dagger t/m [15] Saber (zwaarden), [16-19] Rustingen, [20-24] Navigatie-instrumenten, [25-26] speciale items, [29-39] Letters of Marque + Tax-Free Permits

**Wapenbeschrijvingen (0x5dcb0):** 15 zwaarden met aanval-specialisaties (thrust/lash/strike) beschreven in ROM-tekst.

**Wapen-pointertabel (0xb2580):** 3-byte HiROM-pointers, formaat **(bank, lo, hi)** — begint bij Rapier (index 3), niet bij Dagger (index 0).

**Vloot/NPC interactie (0x5cf31):** Merchant Fleet, Battle Fleet, Gossip, Hire, Duel, Check In, Port Info, Buy, Sell, etc.

**Gevecht-narratief hoofdblok (0xbe500–0xbf400):**
- `0xbe586` — "Will you challenge the enemy commodore to a duel?"
- `0xbe5b8` — "The enemy's crew has blocked your attempt."
- `0xbef74` — "You are wise to surrender. According to our law, we'll take away 2/3 of your gold and cargo."
- `0xbefd1` — "Yo ho ho! An easy victim! Men, seize everything they've got!"
- `0xbf15f` — "I admit your victory, but some day my country will avenge my defeat."
- `0xbf1b9` — "The enemy's flagship ran up the white flag. %s %s completely destroyed the %s fleet."
- `0xbf3c6` — "As punishment for your dastardly deeds, we'll seize 3/4 of your gold."
- Vloot-escapeberichten: "We managed to escape!", "The enemy has fled.", "They're too strong for us. We must flee!"

**Duelbewegingen (0x6cc7f):** [0] Thrust, [1] Lash, [2] Strike, [3] Parry, [4] Block, [5] Dodge. Labels: Atk (0x6ccb9), Def (0x6ccc3).

**Duel combat matrix (0x6cd38):** 5 rijen × 6 kolommen, LE16 waarden (high byte altijd 0). Waarden: 4=win, 2=neutraal, 1=verlies.
```
Row/Move   Col0  Col1  Col2  Col3  Col4  Col5
Thrust:      2     2     2     4     2     1
Lash:        1     4     2     2     1     4
Strike:      4     2     1     2     4     2
Parry:       1     2     4     4     1     2
Block:       2     4     1     1     2     4
```
**Let op:** Kolomvolgorde is NIET bevestigd. Brute-force permutatie-zoekopdracht (720 combos) vond 0 perfecte matches tegen tutorial-tegenrelaties. Dodge (rij 6) bevat ROM-adressen, geen matrixdata — het is waarschijnlijk geen aanvals-optie in de matrix.

**Tutorial-tekst (0xea5c6):**
- "Defensive: Parry against Thrust, Block against Lash, Dodge against Strike."
- "Offensive: Strike against Parry, Lash against Dodge, Thrust against Block."
- "Success depends on the action you select and the strength value of the action."
- "The quality of your arms and armor will determine your success."

**Duel-resultaatstrings:**
- `0x6cdf4` — "We defeated the opponent."
- `0x6ce0e` — "The enemy's commodore proposed a duel."

**Swordsmanship stat-label:** `0xb0cfc` — "Swordsmanship"
Sailor swordplay-waarden in sailorData.ts zijn op 0-100 schaal; ROM-stat-tabel voor matrozen nog niet gelokaliseerd.

---

## 11. Handige commando's

```bash
# Dev server starten
cd P:/Uncharted_Waters_2 && npm run dev

# portCharacters.png opnieuw bouwen
python P:/Uncharted_Waters_2/work/build_portcharacters_fresh.py

# Tests draaien
cd P:/Uncharted_Waters_2 && npm test

# Build
cd P:/Uncharted_Waters_2 && npm run build
```

---

---

## 12. Opening Quest Sequences — alle 6 karakters (2026-03-13)

### Status
- ✅ **João** — volledig geïmplementeerd (Lissabon, church/house/pub/harbor flow)
- ✅ **Otto** — volledig geïmplementeerd (London, palace → shipyard → harbor → pub flow)
- ✅ **Catalina** — gecorrigeerd naar origineel (Navy HQ → cafe → harbor)
- ✅ **Ernst** — gecorrigeerd naar origineel (palace/Mercator → shipyard → harbor/Paula)
- ✅ **Pietro** — gecorrigeerd naar origineel (harbor/harbormaster → pub/Camillo → shipyard → harbor)
- ✅ **Ali** — gecorrigeerd naar origineel (cafe/Ladia → shipyard/Salim+creditors → palace/sultan → harbor)

### Begeleiders (gecorrigeerde namen)
| Karakter | Companion | sailorId | Opmerking |
|---|---|---|---|
| Catalina | **Emilio Sanude** | 35 | Was Pedro Orrego — fout! |
| Ernst | **Hans Brugman** | 40 | Was Paula (36) — gecorrigeerd naar origineel! |
| Pietro | **Camillo Stefano** | 37 | Was Giulio Rossi — fout! |
| Ali | **Salim** | 38 | Was Mahmoud al-Rashid — fout! |

### Schepen (gecorrigeerde namen/types)
| Karakter | Schip | Type (id) | Opmerking |
|---|---|---|---|
| Catalina | **REBEL** | Galleon ('11') | Was La Venganza, Brigantine — fout! |
| Ernst | **Meridian** | Caravela Latina ('6') | Was Nao ('9') — fout! |
| Pietro | **Falcon** | Caravela Latina ('6') | Was Fortuna — fout! |
| Ali | **Savahni** | Dhow ('3') | Was Al-Riha — fout! |

### Gewijzigde bestanden
- `src/data/sailorData.ts` — sailors 35/37/38 hernoemd + stats bijgewerkt
- `src/state/actionsPort.ts` — recruit-functies hernoemd, schipstypes/-namen gecorrigeerd
- `src/interface/quest/questData.ts` — alle 4 quest-sequenties herschreven
- `src/interface/quest/getAvailableQuest.ts` — alle 4 trigger-functies herschreven

### Nog NIET geïmplementeerd (toekomstige uitbreiding)
- **Late-game finales** — South America/Neo-Atlantis climaxes zijn stub-loos

---

## 13. Mid-Game Quest Sequences — alle 6 karakters (2026-03-13)

### Port IDs (bevestigd via regularPorts array index+1)
| Port | portId | | Port | portId |
|---|---|---|---|---|
| Lisbon | '1' | | Massawa | '75' |
| Seville | '2' | | Cairo | '76' |
| Istanbul | '3' | | Basra | '77' |
| Barcelona | '4' | | Nagasaki | '100' |
| Genoa | '9' | | Cayenne | '57' |
| Naples | '11' | | Nantes | '29' |
| Venice | '14' | | London | '30' |
| Alexandria | '19' | | Amsterdam | '34' |

### Geïmplementeerde mid-game quests

| Quest ID | Karakter | Port | Building | Fame drempel |
|---|---|---|---|---|
| `joaoPalaceAlberto` | João | Lisbon (1) | palace (6) | adventure ≥ 2000 |
| `joaoHouseAlberto` | João | Lisbon (1) | house (8) | na palace |
| `joaoAliVisitLisbon` | João | Lisbon (1) | pub (2) | adventure ≥ 23500 |
| `joaoMassawaFinal` | João | Massawa (75) | harbor (4) | adventure ≥ 30000 |
| `catalinaReturnNavyHQ` | Catalina | Barcelona (4) | palace (6) | piracy ≥ 500 |
| `catalinaKahnEncounter` | Catalina | Barcelona (4) | cafe (2) | piracy ≥ 5000 |
| `catalinaAlexandria` | Catalina | Alexandria (19) | pub (2) | piracy ≥ 8000 |
| `catalinaMassawa` | Catalina | Massawa (75) | harbor (4) | piracy ≥ 15000 |
| `ottoSevilleSpyMission` | Otto | Seville (2) | pub (2) | trade ≥ 1000 |
| `ottoNantesIntelligence` | Otto | Nantes (29) | pub (2) | trade ≥ 5000 |
| `ottoCatalinaMeeting` | Otto | Genoa (9) | pub (2) | trade ≥ 8000 |
| `ottoLondonAdmiral` | Otto | London (30) | palace (6) | trade ≥ 30000 |
| `ernstWorldMapProgress` | Ernst | Amsterdam (34) | palace (6) | adventure ≥ 5000 |
| `ernstHansZipangu` | Ernst | Nagasaki (100) | pub (2) | adventure ≥ 20000 |
| `ernstHansLisbon` | Ernst | Lisbon (1) | pub (2) | adventure ≥ 25000 |
| `pietroLisbonMeetDuchess` | Pietro | Lisbon (1) | palace (6) | harborFinal done |
| `pietroAfricaElDorado` | Pietro | Cairo (76) | pub (2) | adventure ≥ 10000 |
| `pietroFortuneTeller` | Pietro | Naples (11) | pub (2) | adventure ≥ 15000 |
| `pietroMassawaStaff` | Pietro | Massawa (75) | harbor (4) | adventure ≥ 20000 |
| `pietroNagasaki` | Pietro | Nagasaki (100) | pub (2) | adventure ≥ 30000 |
| `pietroCayenne` | Pietro | Cayenne (57) | harbor (4) | adventure ≥ 35000 |
| `pietroLisbonEpilogue` | Pietro | Lisbon (1) | palace (6) | adventure ≥ 40000 |
| `aliLadiaRepay` | Ali | Istanbul (3) | cafe (2) | harborFinal done |
| `aliIstanbulSultanReturn` | Ali | Istanbul (3) | palace (6) | trade ≥ 3000 |
| `aliBasraSapha` | Ali | Basra (77) | pub (2) | trade ≥ 8000 |
| `aliVeniceHowell` | Ali | Venice (14) | pub (2) | trade ≥ 12000 |
| `aliVeniceSaphaAccepts` | Ali | Venice (14) | pub (2) | trade ≥ 40000 + aliBasraSapha |
| `aliIstanbulEpilogue` | Ali | Istanbul (3) | cafe (2) | trade ≥ 45000 + Sapha accepted |

### Technische aanpak
- `getPlayerSailorId()` controle in getAvailableQuest.ts voor cross-port quests
- Home-port functies (getCatalinaQuest etc.) uitgebreid met mid-game checks
- Aparte `getMidgameQuest`-helpers per karakter voor niet-thuisport triggers
- Lisbon (portId '1') checkt `playerSailorId` eerst voor Pietro/João routing
- `state.fame.adventure / .piracy / .trade` als drempel (geen nieuwe selectors nodig)

### Gewijzigde bestanden
- `src/interface/quest/questData.ts` — 28 nieuwe quest entries toegevoegd
- `src/interface/quest/getAvailableQuest.ts` — volledig herschreven met mid-game routing

---

### Hans Brugman — Ernst's companion (2026-03-13)

**sailorId:** `'40'` — nieuw aangemaakt. Gunner, age 28, combat-gericht (courage 88, swordplay 82, battleLevel 8, skill Gunnery)

**Gewijzigde bestanden:**
- `src/data/sailorData.ts` — sailorId '40' (Hans Brugman) toegevoegd
- `src/state/actionsPort.ts` — `recruitHans()` toegevoegd
- `src/interface/quest/questData.ts` — `ernstHarborPaula` → `ernstHarborHans`; `ernstHarbor` departure herschreven; `ernstPaulaChangan` → `ernstHansLisbon` (Hans' backstory in Lissabon pub)
- `src/interface/quest/getAvailableQuest.ts` — routing bijgewerkt; Lissabon pub trigger voor Hans

**Valkuil:** characterId '39' was al in gebruik (Duchess Christiana, Pietro's mid-game). Hans gebruikt daarom **'40'**, niet '39'.

---

## 15. Port Siege / Belegering (geïmplementeerd 2026-03-13)

### Werking

Een haven is "geblokkeerd" als `isPortBlockaded()` true is (dominante allegiance ≥ 50, dominant land ≠ speler nationaliteit, geen supplyport).

**Bij het aanmeren:** notificatie "Hostile Port — This port is under foreign control."

**Bij betreden Palace ('6') of Guild ('7'):** `BlockadeGuard.tsx` onderschept via `Building.tsx`.

### BlockadeGuard drie scenario's

| Situatie | Gedrag |
|---|---|
| `friendly = true` (friendship ≥ 50) | Doorlaten zonder kosten |
| Genoeg goud (≥ 500) | Confirm-dialoog → 500 gold betalen → doorlaten |
| Te weinig goud | Afwijzen → acknowledge → `exitBuilding()` |

Na succesvolle doorgang: `blockadeCleared = true` (useState in Building.tsx) → normaal gebouw opens.

### Betrokken bestanden

| Bestand | Wijziging |
|---|---|
| `src/state/selectors.ts` | `getBlockadeInfo()` toegevoegd (nation + friendly) |
| `src/state/actionsPort.ts` | `payBlockadeBribe(500)` toegevoegd |
| `src/state/actionsWorld.ts` | `dock()`: notificatie bij blockaded port |
| `src/interface/port/BlockadeGuard.tsx` | **Nieuw** — guard confrontatie component |
| `src/interface/port/Building.tsx` | Blockade-interceptie vóór Palace/Guild render |

### `getBlockadeInfo()` returnwaarde

```typescript
{ nation: string; friendly: boolean } | null
// nation: 'Portugal' | 'Spain' | 'Ottoman Empire' | 'England' | 'Italy' | 'Holland'
// friendly: state.friendship[key] >= 50
// null als port niet blockaded
```

### Bribe cost

`BRIBE_COST = 500` — constante in `BlockadeGuard.tsx`, makkelijk aanpasbaar.

---

## 16. Late-game finales (geïmplementeerd 2026-03-13)

### Overzicht per karakter

| Karakter | Quest ID | Trigger | Locatie |
|---|---|---|---|
| João | `joaoFinaleLisbon` | adventure ≥ 50000 + `joaoPalaceAlberto` done | Lissabon Palace ('1', '6') |
| Catalina | `catalinaFinaleSelran` | piracy ≥ 25000 + `catalinaKahnEncounter` done | Sevilla Pub ('4', '2') |
| Ernst | `ernstFinaleMercator` | adventure ≥ 40000 + `ernstWorldMapProgress` done | Antwerpen Palace ('34', '6') |
| Otto | `ottoLondonAdmiral` | trade ≥ 30000 | London Palace ('30', '6') — al aanwezig |
| Pietro | `pietroLisbonEpilogue` | adventure ≥ 40000 | Lissabon Palace ('1', '6') — al aanwezig |
| Ali | `aliIstanbulEpilogue` | trade ≥ 45000 | Istanbul Pub ('3', '2') — al aanwezig |

### João finale — `joaoFinaleLisbon`
Alberto is gevonden (levend, in Goa, koos vrijwillig te blijven). Koning benoemt João tot "Admiral of the Eastern Routes". Enrico leest Alberto's boodschap voor: "Do not sail back. Sail forward."

### Catalina finale — `catalinaFinaleSelran`
Selran (bounty hunter, eerder aangeduid in `catalinaReturnNavyHQ`) confronteert Catalina in een Sevillaanse taverne. Catalina stelt hem een ultimatum: loop weg en vertel de marine dat ze dood is. Selran accepteert. Emilio aanwezig. Catalina is voortaan buiten bereik van Spanje.

### Ernst finale — `ernstFinaleMercator`
Ernst keert terug naar Antwerpen met de voltooide wereldkaart (22 jaar na de opdracht). Mercator is van slag. De kaart zal alle schepen na hen begeleiden — zonder dat iemand Ernst's naam kent. Ernst: "They do not need to." Hans sluit af: "It was worth every mile, captain."

### Routing

- **João**: `getJoaoMidgameQuest()` — in Lissabon portId '1' blok, na `joaoPalaceAlberto` check
- **Catalina**: `getCatalinaQuest()` — in `finishedQuest('catalinaHarbor')` blok, na `catalinaKahnEncounter`
- **Ernst**: `getErnstQuest()` — buildingId '6' blok, na `ernstWorldMapProgress` check

---

*Bijgewerkt: 2026-03-13 — Port siege + late-game finales geïmplementeerd; build clean (0 errors, 3 size warnings)*
