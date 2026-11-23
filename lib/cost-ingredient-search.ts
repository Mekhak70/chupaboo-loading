import { INGREDIENT_GROUPS } from "@/lib/ingredient-pricing";
import type { CostIngredient, CostProfile } from "@/lib/cake-cost";
export const COST_INGREDIENT_GROUPS={all:"Բոլորը",meat:"Միս",vegetables:"Բանջարեղեն և հացահատիկ",fruit:"Մրգեր",cream:"Կրեմ",custom:"Իմ ավելացրածները"} as const;
export type CostIngredientGroup=keyof typeof COST_INGREDIENT_GROUPS;
export type CostIngredientStatus="all"|"unpriced"|"used";
export function costIngredientGroup(item:CostIngredient):Exclude<CostIngredientGroup,"all"> {
  if(item.category==="meat")return "meat";
  const groups=["meat","vegetables","fruit","cream"] as const;
  const index=INGREDIENT_GROUPS.findIndex(group=>group.items.some(([id])=>id===item.id));
  return index<0?"custom":groups[index];
}
export function costIngredientGrams(item:CostIngredient,profile:CostProfile):number|null {
  return item.category==="meat"?(profile.meatId===item.id?profile.meatGrams:0):Object.prototype.hasOwnProperty.call(profile.grams,item.id)?profile.grams[item.id]:0;
}
export function filterCostIngredients(items:CostIngredient[],profile:CostProfile,query:string,group:CostIngredientGroup,status:CostIngredientStatus,editingId:string|null=null) {
  const terms=query.trim().toLocaleLowerCase("hy").split(/\s+/).filter(Boolean);
  return items.filter(item=>{
    const text=`${item.name} ${item.id}`.toLocaleLowerCase("hy");
    return terms.every(term=>text.includes(term))&&(group==="all"||costIngredientGroup(item)===group)&&
      (status==="all"||item.id===editingId||(status==="unpriced"?item.pricePerKg===null:(costIngredientGrams(item,profile)??0)>0));
  }).sort((a,b)=>a.name.localeCompare(b.name,"hy"));
}
