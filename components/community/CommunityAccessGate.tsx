"use client"
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import "./community.css"
import { supabase } from "@/lib/supabase"
import { petAge,validBirthday,yerevanToday } from "./pet-details"

type Pet={id:string;name:string;species:string;breed:string;sex:string;birthday:string|null;bio:string;avatar_path:string}
const errorText=(error:unknown)=>error&&typeof error==="object"&&"message"in error?String(error.message):"Գործողությունը չհաջողվեց։"
export default function CommunityAccessGate({children,screen}:{children?:ReactNode;screen?:"register"|"login"}) {
 const router=useRouter()
 const pathname=usePathname()
 const base="/"+pathname.split("/")[1]+"/community"
 const [authLoaded,setAuthLoaded]=useState(false)
 const [checkedFor,setCheckedFor]=useState<string|null>(null)
 const [userId,setUserId]=useState<string|null>(null)
 const [email,setEmail]=useState("")
 const [ready,setReady]=useState(false)
 const [checking,setChecking]=useState(true)
 const [mode,setMode]=useState<"signup"|"login"|"forgot">(screen==="login"?"login":"signup")
 const [error,setError]=useState("")
 const [notice,setNotice]=useState("")
 const [busy,setBusy]=useState(false)
 const [pets,setPets]=useState<Pet[]>([])
 const [selected,setSelected]=useState("")
 const [birthday,setBirthday]=useState("")
 const [file,setFile]=useState<File|null>(null)
 const [preview,setPreview]=useState("")
 const [recovery,setRecovery]=useState(false)
 const [refresh,setRefresh]=useState(0)
 const [verified,setVerified]=useState(false)
 const authIdentity=useRef<string|null>(null)
 const lock=useRef(false)
 const mounted=useRef(true)
 useEffect(()=>{
  if(screen==="login"&&new URLSearchParams(window.location.search).get("registered")==="1")setNotice("Գրանցումն ավարտված է։ Հիմա մուտք գործիր քո էլ. փոստով և գաղտնաբառով։")
 },[screen])
 useEffect(()=>{
  mounted.current=true
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
   const nextId=session?.user.id??null
   if(authIdentity.current!==nextId){authIdentity.current=nextId;setReady(false)}
   setUserId(nextId);setEmail(session?.user.email??"");setVerified(!!session?.user.email_confirmed_at)
   if(event==="SIGNED_OUT"){setReady(false);setPets([])}
   if(event==="PASSWORD_RECOVERY"){setRecovery(true);setReady(false)}
   if(event==="INITIAL_SESSION")setAuthLoaded(true)
  })
  void supabase.auth.getSession().then(({data,error})=>{
   if(!mounted.current)return
   if(error)setError(errorText(error))
   authIdentity.current=data.session?.user.id??null
   setUserId(data.session?.user.id??null);setEmail(data.session?.user.email??"");setVerified(!!data.session?.user.email_confirmed_at);setChecking(false);setAuthLoaded(true)
  })
  return()=>{mounted.current=false;subscription.unsubscribe()}
 },[])
 useEffect(()=>{
  let cancelled=false;setReady(false);setFile(null);setPreview("");setPets([]);setSelected("");setBirthday("")
  if(!userId){setChecking(false);setCheckedFor(null);return}
  setChecking(true);setError("")
  void(async()=>{
   try{
    const [r,p]=await Promise.all([supabase.rpc("community_ready"),supabase.from("community_pets").select("*").eq("owner_id",userId).order("created_at")])
    if(r.error)throw r.error;if(p.error)throw p.error
    if(cancelled)return
    setReady(r.data===true);const list=(p.data??[])as Pet[];setPets(list)
    if(list[0]){setSelected(list[0].id);setBirthday(list[0].birthday??"")}
   }catch(error){if(!cancelled)setError(errorText(error))}
   finally{if(!cancelled){setChecking(false);setCheckedFor(userId)}}
  })()
  return()=>{cancelled=true}
 },[userId,refresh,verified])
 useEffect(()=>{
  if(!authLoaded||checking||recovery||(userId&&checkedFor!==userId))return
  if(!userId&&!screen)router.replace(base+"/register")
  else if(userId&&screen==="login")router.replace(base+(ready?"/profile":"/register"))
  else if(userId&&!ready&&!screen)router.replace(base+"/register")
 },[authLoaded,checking,recovery,userId,checkedFor,screen,ready,router,base])
 useEffect(()=>{
  if(!file){setPreview("");return}
  const objectUrl=URL.createObjectURL(file);setPreview(objectUrl)
  return()=>URL.revokeObjectURL(objectUrl)
 },[file])
 async function run(action:()=>Promise<void>){
  if(lock.current)return
  lock.current=true;setBusy(true);setError("");setNotice("")
  try{await action()}catch(error){if(mounted.current)setError(errorText(error))}
  finally{lock.current=false;if(mounted.current)setBusy(false)}
 }
 const callback=()=>window.location.origin+base+(mode==="forgot"||recovery?"/login":"/register")
 async function authenticate(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const data=new FormData(event.currentTarget)
  await run(async()=>{
   const address=String(data.get("email")??"").trim()
   if(recovery){
    const r=await supabase.auth.updateUser({password:String(data.get("password"))});if(r.error)throw r.error
    setRecovery(false);setRefresh(v=>v+1);setNotice("Գաղտնաբառը փոխված է։");return
   }
   if(mode==="forgot"){
    const r=await supabase.auth.resetPasswordForEmail(address,{redirectTo:callback()});if(r.error)throw r.error
    setNotice("Եթե հաշիվը գոյություն ունի, վերականգնման նամակն ուղարկված է։");return
   }
   const credentials={email:address,password:String(data.get("password"))}
   const r=mode==="signup"?await supabase.auth.signUp({...credentials,options:{emailRedirectTo:callback()}}):await supabase.auth.signInWithPassword(credentials)
   if(r.error)throw r.error
   if(mode==="signup"&&!r.data.session){
    setEmail(address);setMode("login")
    setNotice("Քայլ 1-ը պատրաստ է։ Բացիր հաստատման նամակը՝ գրանցումը և կենդանու պրոֆիլը լրացնելը շարունակելու համար։")
   }
  })
 }
 const current=pets.find(p=>p.id===selected)
 async function savePet(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const form=new FormData(event.currentTarget)
  await run(async()=>{
   if(!userId||!verified)throw Error("Նախ հաստատիր քո էլ. փոստը։")
   if(!validBirthday(birthday))throw Error("Նշիր ճիշտ ծննդյան օր, ամիս և տարի։ Ապագա ամսաթիվ ընտրել չի կարելի։")
   const name=String(form.get("name")).trim(),breed=String(form.get("breed")).trim()
   if(!name||!breed)throw Error("Կենդանու անունն ու ցեղատեսակը պարտադիր են։")
   let path=current?.avatar_path??"",uploaded:string|null=null
   if(file){
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)||!file.size||file.size>5*1024*1024)throw Error("Ընտրիր JPG, PNG կամ WebP նկար՝ մինչև 5 ՄԲ։")
    path=userId+"/"+crypto.randomUUID()+"."+(file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg")
    const r=await supabase.storage.from("community-images").upload(path,file,{contentType:file.type,upsert:false});if(r.error)throw r.error;uploaded=path
   }
   if(!path)throw Error("Կենդանու լուսանկարը պարտադիր է։")
   const values={name,breed,species:String(form.get("species")),sex:String(form.get("sex")),birthday,bio:String(form.get("bio")).trim(),avatar_path:path}
   const result=current?await supabase.from("community_pets").update(values).eq("id",current.id).eq("owner_id",userId).select("id").single():await supabase.from("community_pets").insert(values).select("id").single()
   if(result.error){if(uploaded)await supabase.storage.from("community-images").remove([uploaded]);throw result.error}
   const check=await supabase.rpc("community_ready");if(check.error)throw check.error
   if(!check.data)throw Error("Պրոֆիլը դեռ ամբողջական չէ։ Վերբեռնիր նոր լուսանկար և կրկին պահպանիր։")
   const signedOut=await supabase.auth.signOut({scope:"local"})
   if(signedOut.error)throw signedOut.error
   setReady(false);setFile(null)
   router.replace(base+"/login?registered=1")
  })
 }
 if(!authLoaded||checking||(userId&&checkedFor!==userId))return <div className="ch-community"><div className="ch-access-loading" role="status">Ստուգում ենք քո հաշիվը… 🐾</div></div>
 if(!recovery&&!screen&&(!userId||!ready))return <div className="ch-community"><div className="ch-access-loading" role="status">Բացում ենք գրանցման էջը…</div></div>
 if(!recovery&&screen==="login"&&userId)return <div className="ch-community"><div className="ch-access-loading" role="status">Բացում ենք քո էջը…</div></div>
 if(ready&&!recovery&&!screen)return <>{children}</>
 if(ready&&!recovery&&screen==="register")return <div className="ch-community"><main className="ch-access"><section className="ch-access-card"><h2>Քո գրանցումն արդեն ավարտված է 🐾</h2><p>Կարող ես բացել պրոֆիլդ կամ դուրս գալ և մուտք գործել Login էջից։</p><button className="ch-primary" onClick={()=>router.push(base+"/profile")}>Իմ պրոֆիլը</button><button className="ch-link" disabled={busy} onClick={()=>void run(async()=>{const r=await supabase.auth.signOut({scope:"local"});if(r.error)throw r.error;router.replace(base+"/login")})}>Դուրս գալ և բացել Login-ը</button></section></main></div>
 return <div className="ch-community"><main className="ch-access"><section className="ch-access-story"><span className="ch-eyebrow">CHUPABOO SOCIAL CLUB</span><h1>Քո փոքրիկի<br/>մեծ աշխարհը։</h1><p>Մեր համայնքի պատմությունները բացվում են գրանցվելուց և կենդանու պրոֆիլը լրացնելուց հետո։</p><div className="ch-access-paw" aria-hidden="true">🐾</div><div className="ch-access-steps"><span className={!userId?"active":""}>1 · Հաշիվ և հաստատում</span><span className={userId?"active":""}>2 · Կենդանու պրոֆիլ</span><span>3 · Բարի գալուստ համայնք</span></div></section><section className="ch-access-card">
  {error&&<p className="ch-alert" role="alert">{error}</p>}{notice&&<p className="ch-notice" role="status">{notice}</p>}
  {!userId||recovery?<><h2>{recovery?"Նոր գաղտնաբառ":mode==="signup"?"Սկսենք ծանոթությունից":mode==="login"?"Մուտք քո հաշիվ":"Վերականգնել գաղտնաբառը"}</h2>{mode==="signup"&&!recovery&&<p className="ch-muted">Գրանցումն ավարտելու համար պարտադիր է նաև կենդանու լուսանկարն ու տվյալները լրացնելը՝ հաջորդ քայլին։</p>}<form onSubmit={authenticate}>
   {!recovery&&<label>Էլ. փոստ<input name="email" type="email" required autoComplete="email" defaultValue={email}/></label>}
   {(recovery||mode!=="forgot")&&<label>Գաղտնաբառ<input name="password" type="password" minLength={8} required autoComplete={mode==="signup"||recovery?"new-password":"current-password"}/></label>}
   <button className="ch-primary" disabled={busy}>{busy?"Սպասիր…":recovery?"Պահպանել":mode==="signup"?"Գրանցվել և շարունակել":mode==="login"?"Մուտք գործել":"Ուղարկել նամակը"}</button>
  </form>{!recovery&&<div className="ch-access-links"><button className="ch-link" disabled={busy} onClick={()=>router.push(base+(screen==="login"?"/register":"/login"))}>{screen==="login"?"Նոր հաշիվ ստեղծել":"Արդեն գրանցվա՞ծ ես։ Բացել Login-ը"}</button><button className="ch-link" disabled={busy} onClick={()=>setMode("forgot")}>Մոռացե՞լ ես գաղտնաբառը</button></div>}</>:<><span className="ch-eyebrow">ՔԱՅԼ 2 / 2</span><h2>Ծանոթացրու քո կենդանուն</h2><p className="ch-muted">Բոլոր աստղանիշով դաշտերը պարտադիր են։ Տարիքը հաշվարկվում է ծննդյան ամսաթվից։</p>
   {!verified&&<div className="ch-notice">Հաստատիր էլ. փոստդ՝ {email}։ <button className="ch-link" disabled={busy} onClick={()=>void run(async()=>{const r=await supabase.auth.resend({type:"signup",email,options:{emailRedirectTo:callback()}});if(r.error)throw r.error;setNotice("Հաստատման նամակն ուղարկված է։")})}>Կրկին ուղարկել</button></div>}
   {!!pets.length&&<label>Լրացնել եղած պրոֆիլը կամ ավելացնել նոր կենդանի<select value={selected} onChange={e=>{setSelected(e.target.value);setBirthday(pets.find(p=>p.id===e.target.value)?.birthday??"");setFile(null)}}>{pets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}<option value="">＋ Նոր կենդանի</option></select></label>}
   <form key={selected} onSubmit={savePet}><label>Կենդանու անունը *<input name="name" required maxLength={60} defaultValue={current?.name}/></label>
   <div className="ch-form-row"><label>Կենդանու տեսակ *<select name="species" required defaultValue={current?.species??""}><option value="" disabled>Ընտրիր</option><option value="dog">Շուն</option><option value="cat">Կատու</option><option value="other">Այլ կենդանի</option></select></label><label>Ցեղատեսակ *<input name="breed" required maxLength={100} placeholder="Օրինակ՝ պուդել կամ խառնածին" defaultValue={current?.breed}/></label></div>
   <label>Ծննդյան օր / ամիս / տարի *<input name="birthday" type="date" required value={birthday} max={yerevanToday()} onChange={e=>setBirthday(e.target.value)}/></label>
   {validBirthday(birthday)&&<p className="ch-pet-age">Տարիք՝ {petAge(birthday)}</p>}
   <label>Սեռ<select name="sex" defaultValue={current?.sex??"unknown"}><option value="unknown">Չնշել</option><option value="male">Արու</option><option value="female">Էգ</option></select></label>
   <label>Կենդանու լուսանկարը *<input type="file" accept="image/jpeg,image/png,image/webp" required={!current?.avatar_path} onChange={e=>setFile(e.target.files?.[0]??null)}/></label>
   {(preview||current?.avatar_path)&&<img className="ch-access-preview" src={preview||supabase.storage.from("community-images").getPublicUrl(current!.avatar_path).data.publicUrl} alt="Կենդանու լուսանկար"/>}
   <label>Մի քանի բառ քո կենդանու մասին<textarea name="bio" maxLength={500} rows={2} defaultValue={current?.bio}/></label>
   <p className="ch-muted">Լուսանկարն ու կենդանու տվյալները տեսանելի կլինեն գրանցված համայնքի անդամներին։ Ծննդյան ամսաթիվը և նկարները մի օգտագործիր տիրոջ անձնական տվյալները կիսելու համար։</p>
   <button className="ch-primary" disabled={busy||!verified}>{busy?"Պահպանում ենք…":"Ավարտել գրանցումը և անցնել Login"}</button></form>
   <button className="ch-link" disabled={busy} onClick={()=>void run(async()=>{const r=await supabase.auth.signOut();if(r.error)throw r.error})}>Դուրս գալ / այլ հաշիվ</button>
  </>}
 </section></main></div>
}
