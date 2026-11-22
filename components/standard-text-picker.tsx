"use client";

const options = [
  {value:"STANDARD",label:"Ստանդարտ դիզայն"},
  {value:"CUSTOM_PHOTO",label:"Կենդանու լուսանկարով"},
] as const;

export function StandardTextPicker({value,onChange}:{value:string;onChange:(value:"STANDARD"|"CUSTOM_PHOTO")=>void}) {
  return <fieldset className="rounded-xl border border-purple-100 p-4">
    <legend className="px-2 text-sm font-semibold text-[#69429a]">Ստանդարտ տեքստ</legend>
    <div className="flex flex-wrap gap-2">
      {options.map(option=><button key={option.value} type="button" aria-pressed={value===option.value} onClick={()=>onChange(option.value)} className={`rounded-xl border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69429a] ${value===option.value?"border-[#69429a] bg-[#69429a] text-white":"border-purple-200 bg-white text-[#69429a] hover:bg-purple-50"}`}>
        {option.label}
      </button>)}
    </div>
    <p className="mt-2 text-xs leading-5 text-gray-500">Ընտրված դիզայնը հաճախորդի էջում արդեն ակտիվ կլինի։ Կենդանու լուսանկարի հավելավճարը՝ 5000 դրամ։</p>
  </fieldset>;
}
