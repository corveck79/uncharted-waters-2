# Roadmap

## P1 — Kern gameplay

- [x] **Herberg**: Crew rekruteren ✓ (fix: stap 1 gebruikte hardcoded characterId '1')
- [x] **First mate** UI ✓ — `Mates.tsx` heeft nu "Make First Mate" optie per mate
- [x] **NPC vloot**: posities opslaan ✓ — al geïmplementeerd in `worldCharacters.ts`
- [x] **Scheepswerf**: Remodel ✓
- [x] **Luck mechanic** — `pray()` in `actionsPort.ts` ✓

## P2 — Gameplay uitbreiding

- [x] **Markt**: Invest optie ✓
- [x] **Scheepswerf**: Invest ✓
- [x] **Item Shop**: Haggling ✓
- [x] **Port blockade**: Guards ✓ (inclusief nationality-index fix)
- [x] **Paleis**: Defect ✓
- [x] **Paleis**: Ship reward ✓

## P3 — Polish & technisch

- [x] **Haven**: Ships uid ✓
- [x] **Investments** tracking per port (`PortInfo.tsx`) ✓
- [x] **Sound**: Fade tussen tracks ✓
- [x] **Sound**: OGG detectie + fallback warn ✓
- [x] **Exit animatie** zichtbaar (PercentNextMove pauzeren) ✓
- [x] **Menu bug**: Topmost-menu keyboard stack ✓
- [x] **Service worker** (offline spelen) ✓
- [x] **NPC vloot**: Pathfinding ✓ — collision check hersteld (`npc.destination()`)
