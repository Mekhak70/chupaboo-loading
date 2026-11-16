export const INGREDIENT_GROUPS = [
  {name:"Միս",items:[['CHICKEN','Հավ','chicken'],['BEEF','Տավար','beef'],['LAMB','Գառ','lamb'],['TURKEY','Հնդկահավ','turkey'],['SALMON','Սաղմոն','salmon']]},
  {name:"Բանջարեղեն և հացահատիկ",items:[['POTATO','Կարտոֆիլ','potato'],['CARROT','Գազար','carrot'],['BROCCOLI','Բրոկոլի','broccoli'],['PUMPKIN','Դդում','pumpkin'],['PEPPER','Կանաչ պղպեղ','greenPepper'],['ZUCCHINI','Դդմիկ','zucchini'],['CAULIFLOWER','Ծաղկակաղամբ','cauliflower'],['SWEET_POTATO','Բատատ','sweetPotato'],['SPINACH','Սպանախ','spinach'],['RICE','Բրինձ','rice'],['WHEAT','Հնդկաձավար','wheat'],['OATS','Վարսակ','oats']]},
  {name:"Մրգեր",items:[['APPLE','Խնձոր','apple'],['BANANA','Բանան','banana'],['PEAR','Տանձ','pear'],['ELDERBERRY','Հապալաս','elderberry'],['STRAWBERRY','Ելակ','strawberry'],['MANGO','Մանգո','mango']]},
  {name:"Կրեմ",items:[['DAIRY','Կաթնային','DAIRY'],['PLANTBASEDMILK','Բուսական կաթով','PLANTBASEDMILK'],['PLANTBASED','Բուսական','PLANTBASED']]},
] as const;
type IngredientItem=typeof INGREDIENT_GROUPS[number]["items"][number];
export const INGREDIENT_ITEMS=INGREDIENT_GROUPS.flatMap<IngredientItem>(group=>group.items);
export const INGREDIENT_KEYS=INGREDIENT_ITEMS.map(item=>item[0]);
export type IngredientKey=typeof INGREDIENT_KEYS[number];
export type IngredientPrices=Record<IngredientKey,number>;
export function parseIngredientPrices(value:unknown):IngredientPrices|undefined{
  if(value===null||value===undefined)return undefined;
  if(typeof value!=="object"||Array.isArray(value))throw new Error("Բաղադրիչների գնացուցակը սխալ է։ Ստուգիր ադմինում։");
  const record=value as Record<string,unknown>;
  const result={} as IngredientPrices;
  for(const key of INGREDIENT_KEYS){
    const price=record[key];
    if(typeof price!=="number"||!Number.isFinite(price)||price<0||price>100000000||Math.abs(price*100-Math.round(price*100))>0.0001)throw new Error(`Լրացրու ${INGREDIENT_ITEMS.find(item=>item[0]===key)?.[1]} բաղադրիչի ճիշտ գինը՝ մինչև երկու տասնորդական նիշ։`);
    result[key]=price;
  }
  return result;
}
export interface IngredientSelection {cakeType:string;selectedAnimal:string;selectedVegetables:string[];creamType:string}
export function ingredientPriceLines(prices:IngredientPrices,selection:IngredientSelection,hasCream:boolean){
  const keys=[...(selection.cakeType==='MEAT'?[selection.selectedAnimal]:[]),...selection.selectedVegetables,...(hasCream?[selection.creamType]:[])];
  return keys.map(key=>{
    if(!Object.prototype.hasOwnProperty.call(prices,key))throw new Error("Ընտրված բաղադրիչի գինը բացակայում է։");
    return {key,price:prices[key as IngredientKey]};
  });
}
export function ingredientTotal(prices:IngredientPrices,selection:IngredientSelection,hasCream:boolean):number{
  return Math.round(ingredientPriceLines(prices,selection,hasCream).reduce((sum,line)=>sum+line.price,0)*100)/100;
}
