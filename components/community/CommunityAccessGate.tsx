"use client"
import { Fragment, useEffect, useRef, useState, type ReactNode, type FormEvent } from "react"
import { usePathname,useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { CommunitySessionProvider,useCommunitySession } from "./CommunitySession"
import { petAge,validBirthday,yerevanToday } from "./pet-details"
import "./community.css"

export default function CommunityAccessGate(props:{children?:ReactNode;screen?:"register"|"login"}){
 return <CommunitySessionProvider><Access {...props}/></CommunitySessionProvider>
}
function Access({children,screen}:{children?:ReactNode;screen?:"register"|"login"}){
 const session=useCommunitySession(),router=useRouter(),pathname=usePathname()
 const base="/"+pathname.split("/")[1]+"/community"
 const [mode,setMode]=useState<"signup"|"login"|"forgot">(screen==="login"?"login":"signup")
 const [error,setError]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false)
 const [selected,setSelected]=useState(""),[birthday,setBirthday]=useState(""),[file,setFile]=useState<File|null>(null),[preview,setPreview]=useState("")
 const lock=useRef(false)
 const current=session.pets.find(p=>p.id===selected)
 useEffect(()=>{
  setMode(screen==="login"?"login":"signup");setError("");setNotice("")
  // A shared URL is never evidence of registration or authentication.
  if(screen==="login"){
   try{
    const raw=sessionStorage.getItem("chupaboo.registration.finished")
    sessionStorage.removeItem("chupaboo.registration.finished")
    if(raw){
     const item=JSON.parse(raw)
     if(typeof item.at==="number"&&Date.now()-item.at>=0&&Date.now()-item.at<120000)
      setNotice("Գրանցումն ավարտված է։ Հիմա մուտք գործիր քո տվյալներով։")
    }
   }catch{/* Storage is optional; it does not affect authentication. */}
  }
 },[screen,pathname])
 useEffect(()=>{setSelected(session.pets[0]?.id??"");setBirthday(session.pets[0]?.birthday??"");setFile(null)},[session.user?.id,session.pets])
 useEffect(()=>{if(!file){setPreview("");return}const value=URL.createObjectURL(file);setPreview(value);return()=>URL.revokeObjectURL(value)},[file])
 useEffect(()=>{
  if(screen||session.recovery||session.status==="loading"||session.status==="error")return
  if(session.status==="signed-out")router.replace(base+"/register")
  else if(session.status==="incomplete")router.replace(base+"/register?step=pet")
 },[screen,session.status,session.recovery,router,base])
 async function run(action:()=>Promise<void>){
  if(lock.current)return
  lock.current=true;setBusy(true);setError("");setNotice("")
  try{await action()}catch(e){setError(e&&typeof e==="object"&&"message"in e?String(e.message):"Գործողությունը չհաջողվեց։")}
  finally{lock.current=false;setBusy(false)}
 }
 async function switchAccount(){
  await run(async()=>{const r=await supabase.auth.signOut({scope:"local"});if(r.error)throw r.error;const state=await session.refresh();if(state.status==="error")throw Error(state.error);setMode(screen==="login"?"login":"signup")})
 }
 async function auth(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=new FormData(e.currentTarget)
  await run(async()=>{
   const email=String(form.get("email")??"").trim(),password=String(form.get("password")??"")
   if(session.recovery){
    const r=await supabase.auth.updateUser({password});if(r.error)throw r.error
    session.clearRecovery();await supabase.auth.signOut({scope:"local"});await session.refresh()
    router.replace(base+"/login");setNotice("Գաղտնաբառը փոխված է։ Մուտք գործիր նոր գաղտնաբառով։");return
   }
   if(mode==="forgot"){
    const r=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+base+"/login"});if(r.error)throw r.error
    setNotice("Եթե այդ հասցեով հաշիվ կա, վերականգնման նամակն ուղարկված է։");return
   }
   if(mode==="signup"){
    const r=await supabase.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+base+"/register?step=pet"}});if(r.error)throw r.error
    if(r.data.session){const state=await session.refresh();if(state.status==="error")throw Error(state.error)}
    else setNotice("Բացիր էլ. փոստիդ հաստատման հղումը։ Այն քեզ կվերադարձնի այստեղ՝ կենդանու պարտադիր տվյալները լրացնելու համար։")
    return
   }
   const r=await supabase.auth.signInWithPassword({email,password});if(r.error)throw r.error
   // Only this explicit Login action navigates to the private profile.
   const state=await session.refresh()
   if(state.status==="error")throw Error(state.error)
   if(!state.user||state.user.id!==r.data.user.id)throw Error("Հաշվի ստուգումը չհաջողվեց։ Կրկին մուտք գործիր։")
   router.replace(base+(state.status==="ready"?"/profile":"/register?step=pet"))
  })
 }
 async function savePet(e:FormEvent<HTMLFormElement>){
  e.preventDefault();const form=new FormData(e.currentTarget)
  await run(async()=>{
   const account=await supabase.auth.getUser();if(account.error)throw account.error
   const user=account.data.user
   if(!user||user.id!==session.user?.id)throw Error("Մուտք գործած հաշիվը փոխվել է։ Թարմացրու էջը։")
   if(!user.email_confirmed_at)throw Error("Հաստատիր քո էլ. փոստը։")
   const name=String(form.get("name")).trim(),breed=String(form.get("breed")).trim()
   if(!name||!breed||!validBirthday(birthday))throw Error("Լրացրու անունը, ցեղատեսակը և ճիշտ ծննդյան ամսաթիվը։")
   let path=current?.avatar_path??"",uploaded:string|null=null
   if(file){
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)||!file.size||file.size>5242880)throw Error("Նկար՝ JPG/PNG/WebP, մինչև 5 ՄԲ։")
    path=user.id+"/"+crypto.randomUUID()+"."+(file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg")
    const r=await supabase.storage.from("community-images").upload(path,file,{contentType:file.type,upsert:false});if(r.error)throw r.error;uploaded=path
   }
   if(!path)throw Error("Կենդանու լուսանկարը պարտադիր է։")
   // Server transaction always uses auth.uid(); no client owner/user ID is trusted.
   const result=await supabase.rpc("community_complete_registration",{
    p_username:String(form.get("username")).trim().toLowerCase(),p_display_name:String(form.get("display_name")).trim(),
    p_pet_id:current?.id??null,p_name:name,p_species:String(form.get("species")),p_breed:breed,
    p_birthday:birthday,p_sex:String(form.get("sex")),p_bio:String(form.get("bio")).trim(),p_avatar_path:path,
   })
   if(result.error){if(uploaded)await supabase.storage.from("community-images").remove([uploaded]);throw result.error}
   const out=await supabase.auth.signOut({scope:"local"});if(out.error)throw out.error
   await session.refresh()
   try{sessionStorage.setItem("chupaboo.registration.finished",JSON.stringify({at:Date.now()}))}catch{}
   router.replace(base+"/login")
  })
 }
 const pending=session.status==="loading"
 if(pending)return <div className="ch-community"><div className="ch-access-loading" role="status">Ստուգում ենք մուտքը… 🐾</div></div>
 if(session.status==="error")return <div className="ch-community"><main className="ch-access"><section className="ch-access-card"><h2>Հաշվի ստուգումը չավարտվեց</h2><p className="ch-alert" role="alert">{session.error}</p><button className="ch-primary" onClick={()=>void session.refresh()}>Կրկին փորձել</button><button className="ch-link" onClick={()=>void switchAccount()}>Դուրս գալ</button></section></main></div>
 if(!screen&&!session.recovery){
  if(session.status!=="ready")return <div className="ch-community"><div className="ch-access-loading" role="status">Բացում ենք գրանցման էջը…</div></div>
  return <Fragment key={session.user!.id}><div className="ch-account-strip"><span>Մուտք գործած՝ <strong>{session.user!.email}</strong></span><button disabled={busy} onClick={()=>void switchAccount()}>Փոխել հաշիվը</button></div>{children}</Fragment>
 }
 const temporary=session.status==="incomplete"&&screen==="register"&&!session.recovery
 const existing=session.user&&!temporary&&!session.recovery
 return <div className="ch-community"><main className="ch-access"><section className="ch-access-story"><span className="ch-eyebrow">CHUPABOO SOCIAL CLUB</span><h1>Քո հաշիվը։<br/>Քո փոքրիկի աշխարհը։</h1><p>Գրանցվիր, լրացրու կենդանու տվյալները, հետո առանձին Login էջից մուտք գործիր քո սեփական պրոֆիլ։</p><div className="ch-access-steps"><span className={screen==="register"?"active":""}>1 · Գրանցում և կենդանու պրոֆիլ</span><span className={screen==="login"?"active":""}>2 · Login՝ քո տվյալներով</span><span>3 · Քո էջը և համայնքը</span></div></section><section className="ch-access-card">
 {error&&<p role="alert" className="ch-alert">{error}</p>}{notice&&<p role="status" className="ch-notice">{notice}</p>}
 {existing?<><h2>Այս բրաուզերում արդեն մուտք կա</h2><p>Հաշիվ՝ <strong>{session.user!.email}</strong></p><p className="ch-muted">Սա նոր գրանցում չէ։ Ուրիշ օգտատիրոջ համար նախ փոխիր հաշիվը։</p><button className="ch-primary" disabled={busy} onClick={()=>void switchAccount()}>Դուրս գալ և {screen==="register"?"ստեղծել նոր հաշիվ":"մուտք գործել այլ հաշվով"}</button><button className="ch-link" onClick={()=>router.push(base+(session.status==="ready"?"/profile":"/register?step=pet"))}>Շարունակել այս հաշվով</button></>:temporary?<><h2>Ավարտիր գրանցումը</h2><p className="ch-muted">Գրանցվող հաշիվ՝ {session.user?.email}</p><form key={selected} onSubmit={savePet}>
 <label>Քո անունը *<input name="display_name" required maxLength={70}/></label><label>Քո եզակի @username-ը *<input name="username" required pattern="[a-z][a-z0-9_]{2,23}" minLength={3} maxLength={24} placeholder="mekhak_pets"/></label>
 {!!session.pets.length&&<label>Կենդանու պրոֆիլ<select value={selected} onChange={e=>{setSelected(e.target.value);setBirthday(session.pets.find(p=>p.id===e.target.value)?.birthday??"");setFile(null)}}>{session.pets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}<option value="">＋ Նոր կենդանի</option></select></label>}
 <label>Կենդանու անունը *<input name="name" required maxLength={60} defaultValue={current?.name}/></label><div className="ch-form-row"><label>Տեսակ *<select name="species" required defaultValue={current?.species??""}><option value="" disabled>Ընտրիր</option><option value="dog">Շուն</option><option value="cat">Կատու</option><option value="other">Այլ</option></select></label><label>Ցեղատեսակ *<input name="breed" maxLength={100} required defaultValue={current?.breed} placeholder="Ցեղատեսակ կամ խառնածին"/></label></div>
 <label>Ծննդյան օր / ամիս / տարի *<input type="date" required value={birthday} max={yerevanToday()} onChange={e=>setBirthday(e.target.value)}/></label>{validBirthday(birthday)&&<p className="ch-pet-age">Տարիքը՝ {petAge(birthday)}</p>}
 <label>Սեռ<select name="sex" defaultValue={current?.sex??"unknown"}><option value="unknown">Չնշել</option><option value="male">Արու</option><option value="female">Էգ</option></select></label>
 <label>Լուսանկար *<input type="file" required={!current?.avatar_path} accept="image/jpeg,image/png,image/webp" onChange={e=>setFile(e.target.files?.[0]??null)}/></label>{(preview||current?.avatar_path)&&<img className="ch-access-preview" src={preview||supabase.storage.from("community-images").getPublicUrl(current!.avatar_path).data.publicUrl} alt="Կենդանու նկարի նախադիտում"/>}
 <label>Կարճ նկարագրություն<textarea name="bio" maxLength={500} defaultValue={current?.bio}/></label><button className="ch-primary" disabled={busy||!session.user?.email_confirmed_at}>{busy?"Պահպանում ենք…":"Ավարտել գրանցումը → Login"}</button>
 </form>{!session.user?.email_confirmed_at&&<p className="ch-alert">Նախ հաստատիր email-ը։</p>}<button className="ch-link" disabled={busy} onClick={()=>void switchAccount()}>Սա իմ հաշիվը չէ․ փոխել հաշիվը</button></>:<><h2>{session.recovery?"Նոր գաղտնաբառ":mode==="signup"?"Գրանցում":mode==="forgot"?"Վերականգնել գաղտնաբառը":"Login"}</h2>
 <form onSubmit={auth}>{!session.recovery&&<label>Էլ. փոստ<input name="email" type="email" required autoComplete="email"/></label>}{(mode!=="forgot"||session.recovery)&&<label>Գաղտնաբառ<input name="password" type="password" required minLength={8} autoComplete={mode==="signup"||session.recovery?"new-password":"current-password"}/></label>}
 <button className="ch-primary" disabled={busy}>{busy?"Սպասիր…":session.recovery?"Պահպանել":mode==="signup"?"Գրանցվել":mode==="forgot"?"Ուղարկել նամակը":"Մուտք գործել"}</button></form>
 {!session.recovery&&<><button className="ch-link" disabled={busy} onClick={()=>router.push(base+(screen==="login"?"/register":"/login"))}>{screen==="login"?"Նոր գրանցում":"Արդեն գրանցվա՞ծ ես․ Login"}</button><br/><button className="ch-link" disabled={busy} onClick={()=>setMode(mode==="forgot"?(screen==="login"?"login":"signup"):"forgot")}>{mode==="forgot"?"Վերադառնալ":"Մոռացե՞լ ես գաղտնաբառը"}</button></>}
 </>}
 </section></main></div>
}
