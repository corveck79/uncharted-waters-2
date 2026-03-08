export const goodsData = {
  grain:  { name: 'Grain',  basePrice: 30,  producedIn: ['1', '3', '8'],       demandedIn: ['5', '10', '4'] },
  cloth:  { name: 'Cloth',  basePrice: 100, producedIn: ['2'],                  demandedIn: ['9', '6', '13'] },
  spice:  { name: 'Spice',  basePrice: 400, producedIn: ['11', '12'],           demandedIn: ['1', '2', '3'] },
  sugar:  { name: 'Sugar',  basePrice: 200, producedIn: ['7', '8'],             demandedIn: ['2', '1'] },
  herbs:  { name: 'Herbs',  basePrice: 180, producedIn: ['3', '4'],             demandedIn: ['13', '7', '8'] },
  gold:   { name: 'Gold',   basePrice: 700, producedIn: ['6'],                  demandedIn: ['1', '2', '5'] },
  wine:   { name: 'Wine',   basePrice: 80,  producedIn: ['1', '3'],             demandedIn: ['5', '4', '6'] },
  silk:   { name: 'Silk',   basePrice: 500, producedIn: ['13'],                 demandedIn: ['1', '2', '5'] },
  cotton: { name: 'Cotton', basePrice: 60,  producedIn: ['11', '12'],           demandedIn: ['2', '3'] },
  timber: { name: 'Timber', basePrice: 40,  producedIn: ['2', '13'],            demandedIn: ['4', '6', '9'] },
};

export type GoodsId = keyof typeof goodsData;

const goodsAvailableInMarket: { [marketId: string]: GoodsId[] } = {
  '1':  ['grain', 'wine'],
  '2':  ['cloth', 'timber'],
  '3':  ['grain', 'herbs', 'wine'],
  '4':  ['herbs', 'timber'],
  '5':  ['grain'],
  '6':  ['gold', 'timber'],
  '7':  ['sugar'],
  '8':  ['sugar', 'grain'],
  '9':  ['cloth'],
  '10': ['herbs', 'grain'],
  '11': ['spice', 'cotton', 'herbs'],
  '12': ['spice', 'cotton'],
  '13': ['silk', 'timber'],
};

export const getGoodsAvailableInMarket = (marketId: string): GoodsId[] =>
  goodsAvailableInMarket[marketId] || ['grain', 'cloth'];

export const getBuyPrice = (goodsId: GoodsId, marketId: string): number => {
  const { basePrice, producedIn, demandedIn } = goodsData[goodsId];
  if (producedIn.includes(marketId)) return Math.floor(basePrice * 0.5);
  if (demandedIn.includes(marketId)) return Math.floor(basePrice * 1.5);
  return basePrice;
};

export const getSellPrice = (goodsId: GoodsId, marketId: string): number => {
  const { basePrice, producedIn, demandedIn } = goodsData[goodsId];
  if (demandedIn.includes(marketId)) return Math.floor(basePrice * 1.8);
  if (producedIn.includes(marketId)) return Math.floor(basePrice * 0.4);
  return Math.floor(basePrice * 0.9);
};
