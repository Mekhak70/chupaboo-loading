import { INGREDIENT_GROUPS } from "@/lib/ingredient-pricing";
export const COST_SIZES = { MINI:"Փոքր", MIDI:"Միջին", STANDARD:"Ստանդարտ", DONUT:"Դոնաթ" } as const;
export type CostSize=keyof typeof COST_SIZES;
export const FIXED_COSTS={box:"Տուփ",candle:"Մոմ",bag:"Տոպրակ",sticker:"Ստիկեր",cream:"Կրեմ",baking:"Տորթի թխել / պատրաստում",advertising:"Գովազդ"} as const;
export type FixedCost=keyof typeof FIXED_COSTS;
export interface CostIngredient {id:string;name:string;category:"meat"|"other";pricePerKg:number|null}
export interface CostProfile {fixed:Record<FixedCost,number|null>;meatId:string;meatGrams:number|null;grams:Record<string,number|null>;photoPreparation:number|null}
export interface CakeCostSettings {ingredients:CostIngredient[];profiles:Record<CostSize,CostProfile>;photoMode:"replace"|"add"}
const emptyFixed=()=>Object.fromEntries(Object.keys(FIXED_COSTS).map(key=>[key,null])) as CostProfile['fixed'];
export function defaultCakeCosts():CakeCostSettings {
  const profile=(fixed:CostProfile['fixed'],meatGrams:number|null):CostProfile=>({fixed,meatId:"CHICKEN",meatGrams,grams:{},photoPreparation:5000});
  return {
    ingredients:INGREDIENT_GROUPS.flatMap(group=>group.items.map(([id,name])=>({id,name,category:group.name==="Միս"?"meat" as const:"other" as const,pricePerKg:null}))),
    photoMode:"replace",
    profiles:{
      MINI:profile({box:70,candle:50,bag:100,sticker:70,cream:100,baking:500,advertising:1000},50),
      MIDI:profile({box:170,candle:50,bag:0,sticker:70,cream:200,baking:1000,advertising:1000},100),
      STANDARD:profile({box:400,candle:70,bag:0,sticker:100,cream:300,baking:2000,advertising:1000},250),
      DONUT:profile(emptyFixed(),null),
    },
  };
}
function valid(value:unknown,max:number,precision:number) {
  return value===null||(typeof value==="number"&&Number.isFinite(value)&&value>=0&&value<=max&&Math.abs(value*precision-Math.round(value*precision))<0.00001);
}
export function validateCakeCosts(value:unknown):asserts value is CakeCostSettings {
  if(!value||typeof value!=="object")throw Error("Ինքնարժեքի տվյալները սխալ են։");
  const data=value as CakeCostSettings;
  if(!["replace","add"].includes(data.photoMode)||!Array.isArray(data.ingredients)||data.ingredients.length<1||data.ingredients.length>100||!data.profiles)throw Error("Ինքնարժեքի կարգավորումները սխալ են։");
  const ids=new Set<string>();
  for(const ingredient of data.ingredients){
    if(!ingredient||typeof ingredient.id!=="string"||!ingredient.id||ids.has(ingredient.id)||typeof ingredient.name!=="string"||!ingredient.name.trim()||ingredient.name.length>100||!["meat","other"].includes(ingredient.category)||!valid(ingredient.pricePerKg,100000000,100))throw Error("Ստուգիր մթերքների անուններն ու կիլոգրամի գները։ Գումարները՝ մինչև 2 տասնորդական նիշ։");
    ids.add(ingredient.id);
  }
  for(const size of Object.keys(COST_SIZES) as CostSize[]){
    const profile=data.profiles[size];
    if(!profile||!profile.fixed||!profile.grams||typeof profile.grams!=="object"||Array.isArray(profile.grams)||!data.ingredients.some(item=>item.id===profile.meatId&&item.category==="meat")||!valid(profile.meatGrams,1000000,1000)||!valid(profile.photoPreparation,100000000,100))throw Error(`Ստուգիր «${COST_SIZES[size]}» տեսակի մթերքներն ու գրամները։`);
    for(const key of Object.keys(FIXED_COSTS) as FixedCost[])if(!valid(profile.fixed[key],100000000,100))throw Error(`Ստուգիր «${COST_SIZES[size]}» տեսակի «${FIXED_COSTS[key]}» ծախսը։`);
    for(const [id,grams] of Object.entries(profile.grams))if(!ids.has(id)||data.ingredients.find(item=>item.id===id)?.category==="meat"||!valid(grams,1000000,1000))throw Error(`Ստուգիր «${COST_SIZES[size]}» տեսակի բաղադրիչների գրամները։`);
  }
}
const cents=(amount:number)=>Math.round(amount*100);
export function calculateCakeCost(settings:CakeCostSettings,size:CostSize,photo=false) {
  const profile=settings.profiles[size];
  const missing:string[]=[];
  const lines:{name:string;amount:number;kind:"fixed"|"ingredient";grams?:number;pricePerKg?:number}[]=[];
  for(const key of Object.keys(FIXED_COSTS) as FixedCost[]){
    if(photo&&settings.photoMode==="replace"&&key==="baking")continue;
    const amount=profile.fixed[key];
    if(amount===null||!Number.isFinite(amount))missing.push(FIXED_COSTS[key]);
    else lines.push({name:FIXED_COSTS[key],amount,kind:"fixed"});
  }
  if(photo){
    if(profile.photoPreparation===null)missing.push("Լուսանկարով պատրաստում");
    else lines.push({name:"Լուսանկարով պատրաստում",amount:profile.photoPreparation,kind:"fixed"});
  }
  const quantities={...profile.grams,[profile.meatId]:profile.meatGrams};
  for(const [id,grams] of Object.entries(quantities)){
    const ingredient=settings.ingredients.find(item=>item.id===id);
    if(!ingredient)continue;
    if(grams===null){missing.push(`${ingredient.name} · գրամներ`);continue;}
    if(grams<=0)continue;
    if(ingredient.pricePerKg===null||!Number.isFinite(ingredient.pricePerKg)){missing.push(`${ingredient.name} · կգ-ի գին`);continue;}
    lines.push({name:ingredient.name,kind:"ingredient",grams,pricePerKg:ingredient.pricePerKg,amount:Math.round(ingredient.pricePerKg*grams/1000*100)/100});
  }
  const fixed=lines.filter(line=>line.kind==="fixed").reduce((sum,line)=>sum+cents(line.amount),0)/100;
  const ingredients=lines.filter(line=>line.kind==="ingredient").reduce((sum,line)=>sum+cents(line.amount),0)/100;
  return {lines,missing,fixed,ingredients,total:Math.round((fixed+ingredients)*100)/100,complete:missing.length===0};
}

export function costSizeFor(value:unknown):CostSize|null {
  return ({small:"MINI",mini:"MINI",MINI:"MINI",midi:"MIDI",MIDI:"MIDI",standart:"STANDARD",standard:"STANDARD",STANDARD:"STANDARD",DONUT_BOX:"DONUT",DONUT:"DONUT"} as Record<string,CostSize>)[String(value)]??null;
}
/** Apply the final order recipe/design to the chosen size's expense template. */
export function calculateSelectedCakeCost(settings:CakeCostSettings,size:CostSize,selection:Record<string,unknown>) {
  const profile=settings.profiles[size];
  const selected:CostProfile={...profile,fixed:{...profile.fixed},grams:{...profile.grams}};
  const missing:string[]=[];
  if(["MEAT","FRUIT","VEGETABLES"].includes(String(selection.cakeType))){
    if(selection.cakeType!=="MEAT")selected.meatGrams=0;
    else if(typeof selection.selectedAnimal==="string"&&settings.ingredients.some(item=>item.id===selection.selectedAnimal&&item.category==="meat"))selected.meatId=selection.selectedAnimal;
    else missing.push("Մսի տեսակը");
    selected.grams={};
    for(const id of Array.isArray(selection.selectedVegetables)?selection.selectedVegetables:[]){
      const ingredient=settings.ingredients.find(item=>item.id===id);
      if(!ingredient){missing.push(`${String(id)} · մթերքի գին և գրամներ`);continue;}
      const grams=profile.grams[ingredient.id];selected.grams[ingredient.id]=grams&&grams>0?grams:null;
    }
    if(selection.creamType==="")selected.fixed.cream=0;
    else if(typeof selection.creamType==="string"&&(profile.grams[selection.creamType]??0)>0){
      selected.grams[selection.creamType]=profile.grams[selection.creamType];selected.fixed.cream=0;
    }
  }
  const result=calculateCakeCost({...settings,profiles:{...settings.profiles,[size]:selected}},size,selection.designType==="CUSTOM_PHOTO"&&size!=="DONUT");
  return {...result,missing:[...missing,...result.missing],complete:missing.length===0&&result.complete};
}
export function calculateOrderCakeCost(settings:CakeCostSettings,options:Record<string,unknown>|null,fallbackSize:CostSize|null,quantity:number) {
  const selection=options??{};
  const size=selection.productKind==="DONUT_BOX"?"DONUT":costSizeFor(selection.cakeSize)??fallbackSize;
  if(!size)return null;
  let recipes:Record<string,unknown>[]=[selection];
  if(size==="DONUT"){
    if(Array.isArray(selection.donuts)&&selection.donuts.length)recipes=selection.donuts as Record<string,unknown>[];
    else {const count=Number(selection.boxSize);if(![2,4,6].includes(count))return null;recipes=Array.from({length:count},()=>selection);}
  }
  const results=recipes.map(recipe=>calculateSelectedCakeCost(settings,size,recipe));
  const unitCost=results.reduce((sum,result)=>sum+Math.round(result.total*100),0)/100;
  return {unitCost,total:Math.round(unitCost*quantity*100)/100,complete:results.every(result=>result.complete),missing:[...new Set(results.flatMap(result=>result.missing))]};
}
