import type { GoodsId } from './goodsData';

// Per-port buy prices for each goods type, extracted from original UW2 game data.
// portId -> { goodsId -> buyPrice }
// Prices are from the Market Rate (buying price) table in each port's data file.
// Goods mapping: grain=Grain, sugar=Sugar, gold=Gold, silk=Silk, cotton=Cotton,
//   cloth=Wool Cloth (fallback Cotton Cloth), spice=Pepper, timber=Wood,
//   wine=Wine (fallback Raisins), herbs=Coffee
export const portGoodsPrices: { [portId: string]: Partial<Record<GoodsId, number>> } = {
  '1': { grain: 33, sugar: 47, gold: 990, silk: 178, cotton: 49, cloth: 72, spice: 80, timber: 131, wine: 21, herbs: 5 },  // Lisbon
  '2': { grain: 32, sugar: 45, gold: 1010, silk: 178, cotton: 49, cloth: 72, spice: 80, timber: 124, wine: 20, herbs: 4 },  // Seville
  '3': { grain: 6, sugar: 49, gold: 990, silk: 138, cotton: 39, cloth: 91, spice: 75, timber: 39, wine: 14, herbs: 353 },  // Istanbul
  '4': { grain: 31, sugar: 43, gold: 990, silk: 178, cotton: 49, cloth: 72, spice: 79, timber: 135, wine: 19, herbs: 5 },  // Barcelona
  '5': { grain: 25, sugar: 51, gold: 918, silk: 105, cotton: 38, cloth: 44, spice: 97, timber: 97, wine: 41, herbs: 316 },  // Algiers
  '6': { grain: 25, sugar: 50, gold: 927, silk: 112, cotton: 40, cloth: 44, spice: 99, timber: 97, wine: 40, herbs: 326 },  // Tunis
  '7': { grain: 31, sugar: 44, gold: 1030, silk: 187, cotton: 52, cloth: 28, spice: 81, timber: 128, wine: 19, herbs: 5 },  // Valencia
  '8': { grain: 7, sugar: 46, gold: 980, silk: 164, cotton: 15, cloth: 63, spice: 121, timber: 122, wine: 19, herbs: 5 },  // Marseille
  '9': { grain: 8, sugar: 48, gold: 1030, silk: 160, cotton: 15, cloth: 66, spice: 118, timber: 130, wine: 20, herbs: 4 },  // Genoa
  '10': { grain: 7, sugar: 47, gold: 970, silk: 168, cotton: 15, cloth: 62, spice: 124, timber: 128, wine: 19, herbs: 4 },  // Pisa
  '11': { grain: 8, sugar: 49, gold: 1030, silk: 156, cotton: 14, cloth: 34, spice: 120, timber: 125, wine: 20, herbs: 4 },  // Naples
  '12': { grain: 8, sugar: 48, gold: 1050, silk: 163, cotton: 15, cloth: 64, spice: 118, timber: 127, wine: 20, herbs: 5 },  // Syracuse
  '13': { grain: 8, sugar: 48, gold: 980, silk: 166, cotton: 15, cloth: 66, spice: 120, timber: 123, wine: 20, herbs: 5 },  // Palma
  '14': { grain: 7, sugar: 46, gold: 1000, silk: 158, cotton: 14, cloth: 64, spice: 121, timber: 121, wine: 19, herbs: 5 },  // Venice
  '15': { grain: 8, sugar: 48, gold: 1010, silk: 161, cotton: 15, cloth: 65, spice: 117, timber: 126, wine: 20, herbs: 5 },  // Ragusa
  '16': { grain: 8, sugar: 48, gold: 1040, silk: 158, cotton: 14, cloth: 63, spice: 121, timber: 123, wine: 20, herbs: 4 },  // Candia
  '17': { grain: 8, sugar: 49, gold: 1030, silk: 160, cotton: 15, cloth: 65, spice: 118, timber: 121, wine: 20, herbs: 5 },  // Athens
  '18': { grain: 6, sugar: 48, gold: 1040, silk: 138, cotton: 39, cloth: 91, spice: 75, timber: 39, wine: 14, herbs: 343 },  // Salonika
  '19': { grain: 7, sugar: 50, gold: 980, silk: 145, cotton: 41, cloth: 90, spice: 78, timber: 42, wine: 15, herbs: 333 },  // Alexandria
  '20': { grain: 6, sugar: 49, gold: 1000, silk: 138, cotton: 39, cloth: 89, spice: 78, timber: 38, wine: 14, herbs: 350 },  // Jaffa
  '21': { grain: 7, sugar: 51, gold: 1030, silk: 140, cotton: 40, cloth: 90, spice: 72, timber: 40, wine: 15, herbs: 343 },  // Beirut
  '22': { grain: 7, sugar: 47, gold: 1000, silk: 156, cotton: 14, cloth: 65, spice: 123, timber: 126, wine: 19, herbs: 4 },  // Nicosia
  '23': { grain: 22, sugar: 41, gold: 891, silk: 107, cotton: 39, cloth: 44, spice: 99, timber: 95, wine: 35, herbs: 336 },  // Tripoli
  '24': { grain: 7, sugar: 50, gold: 1000, silk: 140, cotton: 40, cloth: 90, spice: 75, timber: 40, wine: 15, herbs: 329 },  // Kaffa
  '25': { grain: 7, sugar: 50, gold: 980, silk: 137, cotton: 39, cloth: 90, spice: 74, timber: 39, wine: 15, herbs: 343 },  // Azov
  '26': { grain: 6, sugar: 48, gold: 990, silk: 140, cotton: 40, cloth: 89, spice: 75, timber: 38, wine: 14, herbs: 340 },  // Trebizond
  '27': { grain: 25, sugar: 51, gold: 927, silk: 115, cotton: 42, cloth: 43, spice: 101, timber: 98, wine: 40, herbs: 313 },  // Ceuta
  '28': { grain: 8, sugar: 49, gold: 1111, silk: 244, cotton: 20, cloth: 87, spice: 138, timber: 100, wine: 16, herbs: 5 },  // Bordeaux
  '29': { grain: 7, sugar: 48, gold: 1100, silk: 242, cotton: 20, cloth: 88, spice: 141, timber: 103, wine: 57, herbs: 4 },  // Nantes
  '30': { grain: 8, sugar: 50, gold: 1078, silk: 249, cotton: 20, cloth: 94, spice: 147, timber: 101, wine: 59, herbs: 5 },  // London
  '31': { grain: 7, sugar: 47, gold: 1089, silk: 249, cotton: 20, cloth: 90, spice: 140, timber: 99, wine: 55, herbs: 4 },  // Bristol
  '32': { grain: 7, sugar: 48, gold: 1067, silk: 247, cotton: 20, cloth: 87, spice: 140, timber: 102, wine: 57, herbs: 5 },  // Dublin
  '33': { grain: 8, sugar: 49, gold: 979, silk: 244, cotton: 20, cloth: 26, spice: 142, timber: 99, wine: 58, herbs: 4 },  // Antwerp
  '34': { grain: 8, sugar: 49, gold: 1089, silk: 240, cotton: 20, cloth: 90, spice: 141, timber: 96, wine: 58, herbs: 4 },  // Amsterdam
  '35': { grain: 8, sugar: 50, gold: 1067, silk: 249, cotton: 20, cloth: 89, spice: 135, timber: 101, wine: 60, herbs: 5 },  // Copenhagen
  '36': { grain: 8, sugar: 51, gold: 1100, silk: 240, cotton: 20, cloth: 91, spice: 138, timber: 102, wine: 60, herbs: 4 },  // Hamburg
  '37': { grain: 8, sugar: 49, gold: 1078, silk: 244, cotton: 20, cloth: 93, spice: 135, timber: 40, wine: 58, herbs: 5 },  // Oslo
  '38': { grain: 7, sugar: 48, gold: 1122, silk: 242, cotton: 20, cloth: 90, spice: 142, timber: 98, wine: 56, herbs: 4 },  // Stockholm
  '39': { grain: 8, sugar: 50, gold: 1078, silk: 240, cotton: 20, cloth: 90, spice: 141, timber: 101, wine: 60, herbs: 4 },  // Lubeck
  '40': { grain: 7, sugar: 48, gold: 1089, silk: 242, cotton: 20, cloth: 88, spice: 140, timber: 96, wine: 56, herbs: 5 },  // Danzig
  '41': { grain: 7, sugar: 47, gold: 1133, silk: 249, cotton: 20, cloth: 93, spice: 141, timber: 40, wine: 56, herbs: 5 },  // Riga
  '42': { grain: 8, sugar: 52, gold: 1089, silk: 244, cotton: 20, cloth: 90, spice: 140, timber: 99, wine: 62, herbs: 4 },  // Bergen
  '43': { grain: 15, sugar: 86, gold: 270, silk: 37, cotton: 53, cloth: 18, spice: 35, timber: 30, wine: 30, herbs: 19 },  // Caracas
  '44': { grain: 14, sugar: 83, gold: 272, silk: 37, cotton: 52, cloth: 18, spice: 36, timber: 29, wine: 29, herbs: 19 },  // Cartegena
  '45': { grain: 35, sugar: 80, gold: 257, silk: 38, cotton: 48, cloth: 19, spice: 30, timber: 27, wine: 35, herbs: 28 },  // Havana
  '46': { grain: 14, sugar: 81, gold: 261, silk: 36, cotton: 51, cloth: 18, spice: 35, timber: 29, wine: 28, herbs: 20 },  // Margarita
  '47': { grain: 35, sugar: 80, gold: 257, silk: 39, cotton: 49, cloth: 20, spice: 30, timber: 28, wine: 35, herbs: 31 },  // Panama
  '48': { grain: 35, sugar: 80, gold: 245, silk: 39, cotton: 49, cloth: 19, spice: 30, timber: 28, wine: 35, herbs: 29 },  // Porto Velho
  '49': { grain: 34, sugar: 8, gold: 247, silk: 41, cotton: 52, cloth: 19, spice: 29, timber: 28, wine: 34, herbs: 30 },  // Santo Domingo
  '50': { grain: 35, sugar: 80, gold: 200, silk: 42, cotton: 52, cloth: 20, spice: 30, timber: 28, wine: 35, herbs: 29 },  // Veracruz
  '51': { grain: 36, sugar: 9, gold: 250, silk: 39, cotton: 49, cloth: 20, spice: 30, timber: 27, wine: 36, herbs: 30 },  // Jamaica
  '52': { grain: 5, sugar: 80, gold: 252, silk: 39, cotton: 49, cloth: 19, spice: 29, timber: 27, wine: 35, herbs: 30 },  // Guatemala
  '53': { grain: 15, sugar: 86, gold: 267, silk: 38, cotton: 53, cloth: 17, spice: 35, timber: 29, wine: 30, herbs: 20 },  // Pernambuco
  '54': { grain: 15, sugar: 85, gold: 186, silk: 38, cotton: 54, cloth: 18, spice: 35, timber: 29, wine: 30, herbs: 20 },  // Rio de Janeiro
  '55': { grain: 14, sugar: 83, gold: 270, silk: 38, cotton: 53, cloth: 18, spice: 34, timber: 29, wine: 29, herbs: 29 },  // Maracaibo
  '56': { grain: 35, sugar: 80, gold: 260, silk: 40, cotton: 51, cloth: 19, spice: 31, timber: 28, wine: 35, herbs: 30 },  // Santiago
  '57': { grain: 15, sugar: 85, gold: 272, silk: 37, cotton: 52, cloth: 17, spice: 35, timber: 30, wine: 30, herbs: 20 },  // Cayenne
  '58': { grain: 50, sugar: 6, gold: 348, silk: 43, cotton: 51, cloth: 17, spice: 48, timber: 24, wine: 30, herbs: 18 },  // Madeira
  '59': { grain: 51, sugar: 61, gold: 303, silk: 38, cotton: 45, cloth: 14, spice: 40, timber: 20, wine: 30, herbs: 15 },  // Santa Cruz
  '60': { grain: 50, sugar: 60, gold: 309, silk: 38, cotton: 45, cloth: 14, spice: 39, timber: 20, wine: 30, herbs: 15 },  // San Jorge
  '61': { grain: 52, sugar: 63, gold: 306, silk: 39, cotton: 47, cloth: 15, spice: 39, timber: 20, wine: 31, herbs: 15 },  // Bissau
  '62': { grain: 50, sugar: 60, gold: 303, silk: 38, cotton: 45, cloth: 15, spice: 41, timber: 19, wine: 30, herbs: 15 },  // Luanda
  '63': { grain: 49, sugar: 59, gold: 306, silk: 39, cotton: 46, cloth: 15, spice: 40, timber: 20, wine: 29, herbs: 14 },  // Argin
  '64': { grain: 49, sugar: 59, gold: 306, silk: 39, cotton: 43, cloth: 15, spice: 40, timber: 20, wine: 29, herbs: 14 },  // Bathurst
  '65': { grain: 51, sugar: 61, gold: 303, silk: 39, cotton: 46, cloth: 15, spice: 40, timber: 19, wine: 30, herbs: 15 },  // Timbuktu
  '66': { grain: 48, sugar: 58, gold: 306, silk: 39, cotton: 46, cloth: 15, spice: 38, timber: 20, wine: 29, herbs: 14 },  // Abidjan
  '67': { grain: 56, sugar: 66, gold: 145, silk: 28, cotton: 56, cloth: 19, spice: 20, timber: 25, wine: 35, herbs: 12 },  // Sofala
  '68': { grain: 54, sugar: 64, gold: 148, silk: 29, cotton: 57, cloth: 19, spice: 20, timber: 25, wine: 34, herbs: 12 },  // Malindi
  '69': { grain: 56, sugar: 66, gold: 151, silk: 28, cotton: 55, cloth: 20, spice: 21, timber: 25, wine: 35, herbs: 12 },  // Mogadishu
  '70': { grain: 57, sugar: 67, gold: 145, silk: 28, cotton: 55, cloth: 19, spice: 21, timber: 25, wine: 36, herbs: 12 },  // Mombasa
  '71': { grain: 57, sugar: 67, gold: 154, silk: 27, cotton: 53, cloth: 20, spice: 20, timber: 25, wine: 36, herbs: 12 },  // Mozambique
  '72': { grain: 56, sugar: 66, gold: 147, silk: 28, cotton: 56, cloth: 20, spice: 20, timber: 25, wine: 35, herbs: 11 },  // Quelimane
  '73': { grain: 15, sugar: 50, gold: 940, silk: 103, cotton: 5, cloth: 23, spice: 21, timber: 117, wine: 10, herbs: 14 },  // Aden
  '74': { grain: 15, sugar: 51, gold: 912, silk: 102, cotton: 5, cloth: 22, spice: 22, timber: 121, wine: 10, herbs: 15 },  // Hormuz
  '75': { grain: 14, sugar: 49, gold: 969, silk: 99, cotton: 4, cloth: 21, spice: 22, timber: 118, wine: 9, herbs: 15 },  // Massawa
  '76': { grain: 14, sugar: 49, gold: 950, silk: 100, cotton: 5, cloth: 23, spice: 21, timber: 118, wine: 9, herbs: 15 },  // Cairo
  '77': { grain: 14, sugar: 49, gold: 988, silk: 101, cotton: 5, cloth: 22, spice: 22, timber: 120, wine: 9, herbs: 15 },  // Basra
  '78': { grain: 15, sugar: 50, gold: 931, silk: 100, cotton: 5, cloth: 22, spice: 21, timber: 120, wine: 10, herbs: 15 },  // Mecca
  '79': { grain: 15, sugar: 51, gold: 950, silk: 104, cotton: 5, cloth: 22, spice: 22, timber: 121, wine: 10, herbs: 15 },  // Quatar
  '80': { grain: 15, sugar: 50, gold: 978, silk: 97, cotton: 4, cloth: 22, spice: 22, timber: 126, wine: 10, herbs: 15 },  // Shiraz
  '81': { grain: 14, sugar: 49, gold: 950, silk: 104, cotton: 5, cloth: 21, spice: 22, timber: 122, wine: 9, herbs: 15 },  // Muscat
  '82': { grain: 3, sugar: 66, gold: 1060, silk: 77, cotton: 10, cloth: 59, spice: 4, timber: 21, wine: 44, herbs: 6 },  // Diu
  '83': { grain: 4, sugar: 68, gold: 1081, silk: 74, cotton: 9, cloth: 61, spice: 4, timber: 21, wine: 45, herbs: 6 },  // Cochin
  '84': { grain: 4, sugar: 68, gold: 1081, silk: 73, cotton: 9, cloth: 57, spice: 4, timber: 21, wine: 45, herbs: 6 },  // Ceylon
  '85': { grain: 4, sugar: 70, gold: 1030, silk: 41, cotton: 16, cloth: 42, spice: 2, timber: 17, wine: 45, herbs: 5 },  // Amboa
  '86': { grain: 4, sugar: 69, gold: 1060, silk: 74, cotton: 9, cloth: 59, spice: 5, timber: 21, wine: 45, herbs: 5 },  // Goa
  '87': { grain: 4, sugar: 71, gold: 1060, silk: 40, cotton: 16, cloth: 41, spice: 2, timber: 17, wine: 45, herbs: 4 },  // Malacca
  '88': { grain: 4, sugar: 71, gold: 1020, silk: 39, cotton: 15, cloth: 40, spice: 2, timber: 18, wine: 45, herbs: 5 },  // Ternate
  '89': { grain: 4, sugar: 70, gold: 1020, silk: 39, cotton: 15, cloth: 41, spice: 2, timber: 17, wine: 45, herbs: 4 },  // Banda
  '90': { grain: 4, sugar: 70, gold: 1030, silk: 41, cotton: 16, cloth: 41, spice: 2, timber: 18, wine: 45, herbs: 4 },  // Dili
  '91': { grain: 4, sugar: 72, gold: 1009, silk: 40, cotton: 16, cloth: 42, spice: 2, timber: 18, wine: 46, herbs: 4 },  // Pasei
  '92': { grain: 3, sugar: 68, gold: 1030, silk: 40, cotton: 16, cloth: 40, spice: 1, timber: 18, wine: 44, herbs: 5 },  // Sunda
  '93': { grain: 3, sugar: 67, gold: 1029, silk: 72, cotton: 9, cloth: 58, spice: 4, timber: 22, wine: 44, herbs: 6 },  // Calicut
  '94': { grain: 4, sugar: 70, gold: 1050, silk: 40, cotton: 16, cloth: 41, spice: 2, timber: 18, wine: 45, herbs: 5 },  // Bankao
  '95': { grain: 4, sugar: 89, gold: 927, silk: 12, cotton: 18, cloth: 72, spice: 49, timber: 15, wine: 69, herbs: 5 },  // Zeiton
  '96': { grain: 5, sugar: 90, gold: 900, silk: 49, cotton: 17, cloth: 71, spice: 50, timber: 15, wine: 70, herbs: 5 },  // Macao
  '97': { grain: 4, sugar: 89, gold: 918, silk: 51, cotton: 18, cloth: 72, spice: 49, timber: 5, wine: 69, herbs: 5 },  // Hanoi
  '98': { grain: 5, sugar: 93, gold: 891, silk: 50, cotton: 18, cloth: 70, spice: 51, timber: 15, wine: 72, herbs: 5 },  // Changan
  '99': { grain: 5, sugar: 90, gold: 873, silk: 51, cotton: 18, cloth: 70, spice: 50, timber: 15, wine: 70, herbs: 5 },  // Sakai
  '100': { grain: 5, sugar: 91, gold: 945, silk: 50, cotton: 18, cloth: 70, spice: 52, timber: 14, wine: 71, herbs: 5 },  // Nagasaki
};

// Get the buy price for a goods at a specific port, or undefined if not known.
export const getPortGoodsBuyPrice = (portId: string, goodsId: GoodsId): number | undefined => {
  return portGoodsPrices[portId]?.[goodsId];
};
