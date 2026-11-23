import { calculateOrderCakeCost,type CakeCostSettings,type CostSize } from "@/lib/cake-cost";
import { money,type SaleItem } from "@/lib/finance";
export function AdminSaleCakeCost({item,settings,size}:{item:SaleItem;settings:CakeCostSettings|null;size:CostSize|null}) {
  if(item.section==="party"||!settings)return null;
  const cost=calculateOrderCakeCost(settings,item.options,size,item.quantity);
  if(!cost)return <p className="mt-2 text-xs text-amber-700">Ինքնարժեքի համար տորթի չափը կամ բոքսի քանակը նշված չէ։</p>;
  return <div className={`mt-3 rounded-xl p-3 text-xs leading-5 ${cost.complete?"bg-purple-50 text-[#69429a]":"bg-amber-50 text-amber-800"}`}>
    <p className="font-semibold">{cost.complete?"Հաշվարկային ինքնարժեք":"Հայտնի ծախսեր"}՝ {money(cost.unitCost)} / հատ{item.quantity>1?` · ${item.quantity} հատ՝ ${money(cost.total)}`:""}</p>
    <p className="mt-1 opacity-70">Ըստ ինքնարժեքի գործող կարգավորումների և պատվերում ընտրված դիզայնի։</p>
    {!cost.complete&&<details className="mt-1"><summary className="cursor-pointer">Հաշվարկը լրացնելու համար</summary><ul className="mt-1 list-inside list-disc">{cost.missing.map(name=><li key={name}>{name}</li>)}</ul></details>}
  </div>;
}
