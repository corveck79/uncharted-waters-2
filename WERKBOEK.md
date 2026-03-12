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
| Gilde | ⚠️ gedeeltelijk | Minimale implementatie |
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

- 🔴 **Zeegevecht** — grootste missende systeem (hart van UW2)
- 🔴 **Navigatie/astrolabe** — kaarten kopen, positie bepalen
- 🟡 **Gilde** — avonturiersquests uitwerken
- 🟡 **Verhaallijnen** — de 5 niet-João karakter-quests
- 🟡 **Port siege/belegering** mechanic uitbreiden
- ⚪ **Meer sprite-extractie** — eventuele gevechts-sprites, FACE-bestanden

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

## 10. Handige commando's

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

*Bijgewerkt: 2026-03-12 — na fix portCharacters sprite-mapping (CHAR bestandsnamen correctie)*
