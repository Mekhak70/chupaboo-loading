"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function CatalogGalleryInput({files,onChange,paths=[],onRemovePath}:{
  files:File[];onChange:(files:File[])=>void;paths?:string[];onRemovePath?:(path:string)=>void;
}){
  const [previews,setPreviews]=useState<string[]>([]);
  const [error,setError]=useState("");
  useEffect(()=>{
    const urls=files.map(file=>URL.createObjectURL(file));setPreviews(urls);
    return()=>urls.forEach(url=>URL.revokeObjectURL(url));
  },[files]);
  return <div className="space-y-3 rounded-xl border border-purple-100 p-4">
    <label className="block text-sm font-medium text-gray-700">Լրացուցիչ նկարներ · մինչև 9 հատ
      <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={event=>{
        const selected=Array.from(event.target.files??[]);event.target.value="";
        if(selected.some(file=>!["image/jpeg","image/png","image/webp"].includes(file.type)||!file.size||file.size>5*1024*1024)){
          setError("Յուրաքանչյուր նկար պետք է լինի JPG/PNG/WebP և մինչև 5 MB։");return;
        }
        if(paths.length+files.length+selected.length>9){setError("Կարող ես ավելացնել մինչև 9 լրացուցիչ նկար։");return;}
        setError("");onChange([...files,...selected]);
      }}/>
    </label>
    <p className="text-xs text-gray-500">Գլխավոր նկարի հետ կցուցադրվեն սլայդերով։</p>
    {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="flex flex-wrap gap-3">
      {paths.map((path,index)=><div key={path} className="w-24"><img src={supabase.storage.from("catalog-images").getPublicUrl(path).data.publicUrl} alt={`Լրացուցիչ նկար ${index+1}`} className="h-24 w-24 rounded-lg object-cover"/><button type="button" className="mt-1 text-xs text-red-600" onClick={()=>onRemovePath?.(path)}>Հեռացնել</button></div>)}
      {files.map((file,index)=><div key={`${file.name}-${index}`} className="w-24"><img src={previews[index]} alt={file.name} className="h-24 w-24 rounded-lg object-cover"/><button type="button" className="mt-1 text-xs text-red-600" onClick={()=>onChange(files.filter((_,i)=>i!==index))}>Հեռացնել</button></div>)}
    </div>
  </div>;
}
