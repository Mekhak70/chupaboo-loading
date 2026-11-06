"use client"
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { supabase } from "@/lib/supabase"

export type SocialProfile = { user_id: string; username: string; display_name: string; bio: string; avatar_path: string | null }
export const imageUrl = (path: string) => supabase.storage.from("community-images").getPublicUrl(path).data.publicUrl
export const socialBase = () => "/" + window.location.pathname.split("/")[1] + "/community"
const err = (e: unknown) => e && typeof e === "object" && "message" in e ? String(e.message) : "Գործողությունը չհաջողվեց։"
export function Avatar({ profile }: { profile: SocialProfile | null }) { return profile?.avatar_path ? <img className="ch-user-avatar" src={imageUrl(profile.avatar_path)} alt={profile.display_name} /> : <span className="ch-user-avatar ch-user-placeholder">{profile?.display_name?.slice(0,1) ?? "🐾"}</span> }

export function ProfilePanel({ userId, username, onLogin, onMessage, onPet }: { userId: string | null; username?: string; onLogin: () => void; onMessage: (id: string) => void; onPet: (pet: any) => void }) {
  const [profile,setProfile] = useState<SocialProfile | null>(null)
  const [editing,setEditing] = useState(false)
  const [loading,setLoading] = useState(true)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState("")
  const [following,setFollowing] = useState(false)
  const [blocked,setBlocked] = useState(false)
  const [followers,setFollowers] = useState(0)
  const [followingCount,setFollowingCount] = useState(0)
  const [members,setMembers] = useState<SocialProfile[] | null>(null)
  const [pets,setPets] = useState<any[]>([])
  const [posts,setPosts] = useState<any[]>([])
  const [page,setPage] = useState(0)
  const [more,setMore] = useState(false)
  const lock=useRef(false)
  const version=useRef(0)
  const own = !!userId && (profile?.user_id === userId || (!username && !profile))
  const refresh = useCallback(async () => {
    const run=++version.current
    setLoading(true); setError(""); setMembers(null); setPosts([]); setPets([]); setPage(0)
    try {
      if (!username && !userId) { setProfile(null); return }
      const result = await supabase.from("community_profiles").select("*").eq(username ? "username" : "user_id", username ?? userId!).maybeSingle()
      if(result.error) throw result.error
      if(run!==version.current)return
      const p = result.data as SocialProfile | null; setProfile(p)
      if (!p) { setEditing(!username && !!userId); return }
      const [a,b,c,d,e,f] = await Promise.all([
        supabase.from("community_follows").select("following_id",{count:"exact",head:true}).eq("following_id",p.user_id),
        supabase.from("community_follows").select("follower_id",{count:"exact",head:true}).eq("follower_id",p.user_id),
        supabase.from("community_pets").select("*").eq("owner_id",p.user_id).order("created_at"),
        supabase.from("community_posts").select("*").eq("owner_id",p.user_id).order("created_at",{ascending:false}).order("id",{ascending:false}).range(0,12),
        userId ? supabase.from("community_follows").select("following_id").eq("follower_id",userId).eq("following_id",p.user_id) : Promise.resolve({data:[],error:null}),
        userId ? supabase.from("community_blocks").select("blocked_id").eq("blocker_id",userId).eq("blocked_id",p.user_id) : Promise.resolve({data:[],error:null}),
      ])
      for(const item of [a,b,c,d,e,f]) if(item.error) throw item.error
      if(run!==version.current)return
      setFollowers(a.count ?? 0); setFollowingCount(b.count ?? 0); setPets(c.data ?? []); setPosts((d.data ?? []).slice(0,12)); setMore((d.data?.length ?? 0)>12); setFollowing(!!e.data?.length); setBlocked(!!f.data?.length)
    } catch(e) { if(run===version.current)setError(err(e)) } finally { if(run===version.current)setLoading(false) }
  },[username,userId])
  useEffect(()=>{ void refresh();return()=>{version.current++} },[refresh])
  async function act(action:()=>Promise<void>) { if(lock.current) return;lock.current=true;setBusy(true);setError("");try{await action()}catch(e){setError(err(e))}finally{lock.current=false;setBusy(false)} }
  async function save(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();if(!userId) return onLogin();const form=new FormData(e.currentTarget)
    await act(async()=>{
      const name=String(form.get("username")).trim().toLowerCase()
      if(!/^[a-z][a-z0-9_]{2,23}$/.test(name)) throw Error("Username՝ 3–24 լատինատառ փոքրատառ, թիվ կամ _, սկզբում՝ տառ։")
      let path=profile?.avatar_path ?? null; const file=form.get("avatar") as File | null; let uploaded:string|null=null
      if(file?.size){
        if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024) throw Error("Նկար՝ JPG/PNG/WebP, մինչև 5 ՄԲ։")
        path=userId+"/profile-"+crypto.randomUUID()+"."+(file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg")
        const r=await supabase.storage.from("community-images").upload(path,file,{contentType:file.type});if(r.error) throw r.error;uploaded=path
      }
      const values={username:name,display_name:String(form.get("display_name")).trim(),bio:String(form.get("bio")).trim(),avatar_path:path}
      const result=profile ? await supabase.from("community_profiles").update(values).eq("user_id",userId).select("*").single() : await supabase.from("community_profiles").insert(values).select("*").single()
      if(result.error){ if(uploaded) await supabase.storage.from("community-images").remove([uploaded]); throw result.error }
      setProfile(result.data as SocialProfile);setEditing(false)
      if(username && username!==name) window.location.assign(socialBase()+"/u/"+name)
    })
  }
  async function showMembers(kind:"followers"|"following") {
    if(!profile) return
    await act(async()=>{
      const field=kind==="followers"?"follower_id":"following_id"
      const r=await supabase.from("community_follows").select(field).eq(kind==="followers"?"following_id":"follower_id",profile.user_id).limit(100)
      if(r.error) throw r.error
      const ids=(r.data ?? []).map((row:any)=>row[field]);if(!ids.length){setMembers([]);return}
      const p=await supabase.from("community_profiles").select("*").in("user_id",ids);if(p.error)throw p.error;setMembers(p.data as SocialProfile[])
    })
  }
  return <section className="ch-social-panel">{error&&<p role="alert" className="ch-alert">{error}</p>}{loading?<p role="status">Բեռնում…</p>:<>
    {!profile&&!editing&&<p>Պրոֆիլը չի գտնվել։{!userId&&<button className="ch-link" onClick={onLogin}>Մուտք գործել</button>}</p>}
    {profile&&<><div className="ch-human-profile"><Avatar profile={profile}/><div><h2>{profile.display_name}</h2><span>@{profile.username}</span><p>{profile.bio}</p><div className="ch-profile-stats"><button onClick={()=>void showMembers("followers")}>{followers} հետևորդ</button><button onClick={()=>void showMembers("following")}>{followingCount} հետևվող</button></div></div></div><div className="ch-social-actions">{own?<button className="ch-primary" onClick={()=>setEditing(true)}>Խմբագրել պրոֆիլը</button>:<><button className="ch-primary" disabled={busy||blocked} onClick={()=>{if(!userId)return onLogin();void act(async()=>{const r=following?await supabase.from("community_follows").delete().eq("follower_id",userId).eq("following_id",profile.user_id):await supabase.from("community_follows").insert({following_id:profile.user_id});if(r.error)throw r.error;setFollowing(!following);setFollowers(v=>v+(following?-1:1))})}}>{following?"Չհետևել":"Հետևել"}</button><button className="ch-secondary" disabled={blocked} onClick={()=>userId?onMessage(profile.user_id):onLogin()}>Նամակ գրել</button><button className="ch-link" disabled={busy} onClick={()=>{if(!userId)return onLogin();void act(async()=>{const r=await supabase.rpc("community_block_user",{target:profile.user_id,blocked:!blocked});if(r.error)throw r.error;await refresh()})}}>{blocked?"Հանել արգելափակումը":"Արգելափակել"}</button></>}</div></>}
    {editing&&<form className="ch-profile-editor" onSubmit={save}><h3>{profile?"Քո պրոֆիլը":"Ստեղծիր քո անձնական էջը"}</h3><label>Անուն<input name="display_name" required maxLength={70} defaultValue={profile?.display_name}/></label><label>Եզակի @username<input name="username" required minLength={3} maxLength={24} pattern="[a-z][a-z0-9_]{2,23}" defaultValue={profile?.username} placeholder="mekhak_pets"/></label><label>Քո մասին<textarea name="bio" maxLength={500} defaultValue={profile?.bio}/></label><label>Պրոֆիլի նկար<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp"/></label><button className="ch-primary" disabled={busy}>Պահպանել</button>{profile&&<button type="button" className="ch-link" onClick={()=>setEditing(false)}>Չեղարկել</button>}</form>}
    {members&&<div className="ch-member-list"><button className="ch-link" onClick={()=>setMembers(null)}>Փակել ցուցակը ×</button>{!members.length&&<p>Ցուցակը դատարկ է։</p>}{members.map(p=><a className="ch-user-row" key={p.user_id} href={socialBase()+"/u/"+p.username}><Avatar profile={p}/><span>{p.display_name}<small>@{p.username}</small></span></a>)}<small>Ցուցադրվում են մինչև 100 անդամ։</small></div>}
    {!!pets.length&&<><h3>Կենդանիները</h3><div className="ch-pet-grid">{pets.map(p=><button className="ch-pet-card" key={p.id} onClick={()=>onPet(p)}><img src={imageUrl(p.avatar_path)} alt={p.name}/><strong>{p.name}</strong></button>)}</div></>}
    {profile&&<><h3>Հրապարակումներ</h3><div className="ch-profile-album">{posts.map(p=><a key={p.id} href={socialBase()+"?post="+p.id} aria-label={p.caption||"Բացել հրապարակումը"}>{p.media_kind==="video"?<video src={supabase.storage.from("community-videos").getPublicUrl(p.image_path).data.publicUrl} muted playsInline preload="metadata"/>:<img src={imageUrl(p.image_path)} alt={p.caption||"Հրապարակում"} loading="lazy"/>}</a>)}</div>{!posts.length&&<p>Դեռ հրապարակումներ չկան։</p>}{more&&<button className="ch-secondary" disabled={busy} onClick={()=>void act(async()=>{const next=page+1;const r=await supabase.from("community_posts").select("*").eq("owner_id",profile.user_id).order("created_at",{ascending:false}).order("id",{ascending:false}).range(next*12,next*12+12);if(r.error)throw r.error;setPosts(v=>[...v,...(r.data??[]).slice(0,12)]);setMore((r.data?.length??0)>12);setPage(next)})}>Տեսնել ավելին</button>}</>}
  </>}</section>
}

export function SearchPanel(){
 const [query,setQuery]=useState("");const [profiles,setProfiles]=useState<SocialProfile[]>([]);const [pets,setPets]=useState<any[]>([]);const [loading,setLoading]=useState(false);const [error,setError]=useState("")
 useEffect(()=>{let cancelled=false;setError("");const term=query.trim().replace(/[,%_().]/g,"").slice(0,50);if(term.length<2){setProfiles([]);setPets([]);setLoading(false);return}setLoading(true);const timer=setTimeout(()=>{void(async()=>{try{const [a,b]=await Promise.all([supabase.from("community_profiles").select("*").or("username.ilike.%"+term+"%,display_name.ilike.%"+term+"%").limit(20),supabase.from("community_pets").select("*").ilike("name","%"+term+"%").limit(20)]);if(a.error)throw a.error;if(b.error)throw b.error;if(!cancelled){setProfiles(a.data as SocialProfile[]);setPets(b.data??[])}}catch(e){if(!cancelled)setError(err(e))}finally{if(!cancelled)setLoading(false)}})()},300);return()=>{cancelled=true;clearTimeout(timer)}},[query])
 return <section className="ch-social-panel"><label className="ch-search-label">Գտիր ընկերներ ու փոքրիկ թաթիկներին<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Անուն, @username կամ կենդանու անուն…" maxLength={50}/></label>{error&&<p role="alert">{error}</p>}{loading&&<p role="status">Որոնում…</p>}<h3>Մարդիկ</h3>{profiles.map(p=><a className="ch-user-row" href={socialBase()+"/u/"+p.username} key={p.user_id}><Avatar profile={p}/><span>{p.display_name}<small>@{p.username}</small></span><b>↗</b></a>)}<h3>Կենդանիներ</h3>{pets.map(p=><a className="ch-user-row" href={socialBase()+"?pet="+p.id} key={p.id}><img className="ch-user-avatar" src={imageUrl(p.avatar_path)} alt=""/><span>{p.name}<small>{p.bio}</small></span><b>🐾</b></a>)}{query.trim().length<2?<p className="ch-muted">Մուտքագրիր առնվազն 2 նիշ։</p>:!loading&&!profiles.length&&!pets.length&&<p>Արդյունքներ չկան։</p>}</section>
}

type Thread={id:string;peer_id:string;username:string;display_name:string;avatar_path:string|null;last_body:string|null;last_at:string;unread:number}
type Message={id:string;sender_id:string;body:string;created_at:string}
export function MessagesPanel({userId,peer,onLogin}:{userId:string|null;peer:string|null;onLogin:()=>void}){
 const [threads,setThreads]=useState<Thread[]>([]);const [active,setActive]=useState<string|null>(null);const [messages,setMessages]=useState<Message[]>([]);const [text,setText]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);const [loading,setLoading]=useState(false);const [older,setOlder]=useState(false);const lock=useRef(false);const generation=useRef(0);const bottom=useRef<HTMLDivElement>(null)
 const inbox=useCallback(async()=>{const r=await supabase.rpc("community_inbox");if(r.error)throw r.error;return(r.data??[])as Thread[]},[])
 useEffect(()=>{let cancelled=false;setThreads([]);setActive(null);setMessages([]);setError("");if(!userId)return;const refresh=async()=>{try{const data=await inbox();if(!cancelled)setThreads(data)}catch(e){if(!cancelled)setError(err(e))}};void refresh();const timer=setInterval(()=>void refresh(),5000);return()=>{cancelled=true;clearInterval(timer)}},[userId,inbox])
 useEffect(()=>{let cancelled=false;if(!peer||!userId)return;void(async()=>{try{const r=await supabase.rpc("community_start_chat",{peer});if(r.error)throw r.error;const data=await inbox();if(!cancelled){setThreads(data);setActive(String(r.data))}}catch(e){if(!cancelled)setError(err(e))}})();return()=>{cancelled=true}},[peer,userId,inbox])
 useEffect(()=>{
  let cancelled=false;const epoch=++generation.current;let first=true
  setMessages([]);setOlder(false);setError("");if(!active||!userId)return;setLoading(true)
  const refresh=async()=>{try{
    const r=await supabase.from("community_messages").select("id,sender_id,body,created_at").eq("conversation_id",active).order("created_at",{ascending:false}).order("id",{ascending:false}).limit(51)
    if(r.error)throw r.error;if(cancelled||epoch!==generation.current)return
    const page=(r.data??[]).slice(0,50).reverse()as Message[]
    setMessages(previous=>{const map=new Map([...previous,...page].map(m=>[m.id,m]));return[...map.values()].sort((a,b)=>a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id))})
    if(first){setOlder((r.data?.length??0)>50);first=false}
    const mark=await supabase.rpc("community_mark_read",{chat:active,through_at:page[page.length-1]?.created_at ?? null});if(mark.error)throw mark.error
    const list=await inbox();if(!cancelled)setThreads(list)
   }catch(e){if(!cancelled)setError(err(e))}finally{if(!cancelled)setLoading(false)}}
  void refresh();const timer=setInterval(()=>void refresh(),4000)
  return()=>{cancelled=true;clearInterval(timer);generation.current++}
 },[active,userId,inbox])
 const latestId=messages[messages.length-1]?.id
 useEffect(()=>{bottom.current?.scrollIntoView({block:"nearest",behavior:"smooth"})},[latestId])
 const current=threads.find(t=>t.id===active)
 async function send(e:FormEvent){
  e.preventDefault();if(!active||!text.trim()||lock.current)return
  const epoch=generation.current;const chat=active;lock.current=true;setBusy(true);setError("")
  try{
   const r=await supabase.rpc("community_send_message",{chat,content:text.trim()});if(r.error)throw r.error
   if(epoch!==generation.current)return;setText("")
   const item=await supabase.from("community_messages").select("id,sender_id,body,created_at").eq("id",r.data).single();if(item.error)throw item.error
   if(epoch===generation.current)setMessages(previous=>previous.some(m=>m.id===item.data.id)?previous:[...previous,item.data as Message])
  }catch(e){if(epoch===generation.current)setError(err(e))}finally{lock.current=false;setBusy(false)}
 }
 if(!userId)return <button className="ch-primary" onClick={onLogin}>Մուտք գործիր՝ նամակներ կարդալու համար</button>
 return <section className="ch-inbox"><aside><h3>Նամակներ</h3>{!threads.length&&<p className="ch-muted">Գտիր ընկերոջը որոնումով և նրա էջից սեղմիր «Նամակ գրել»։ Նախ լրացրու քո անձնական պրոֆիլը։</p>}{threads.map(t=><button className={"ch-thread "+(active===t.id?"active":"")} key={t.id} onClick={()=>{setText("");setActive(t.id)}}><Avatar profile={{user_id:t.peer_id,username:t.username,display_name:t.display_name,bio:"",avatar_path:t.avatar_path}}/><span><strong>{t.display_name}</strong><small>{t.last_body||"Սկսիր զրույցը"}</small></span>{Number(t.unread)>0&&<b>{t.unread}</b>}</button>)}</aside><div className="ch-chat"><header>{current?<a href={socialBase()+"/u/"+current.username}>@{current.username}</a>:"Ընտրիր զրույցը"}</header>{error&&<p role="alert" className="ch-alert">{error}</p>}<div className="ch-chat-scroll">{loading&&<p role="status">Բեռնում…</p>}{older&&messages.length>0&&<button className="ch-link" onClick={()=>{const epoch=generation.current;const first=messages[0];void(async()=>{try{
  const filter="created_at.lt."+first.created_at+",and(created_at.eq."+first.created_at+",id.lt."+first.id+")"
  const r=await supabase.from("community_messages").select("id,sender_id,body,created_at").eq("conversation_id",active!).or(filter).order("created_at",{ascending:false}).order("id",{ascending:false}).limit(51)
  if(r.error)throw r.error;if(epoch!==generation.current)return
  setMessages(previous=>[...(r.data??[]).slice(0,50).reverse()as Message[],...previous]);setOlder((r.data?.length??0)>50)
 }catch(e){if(epoch===generation.current)setError(err(e))}})()}}>Ավելի հին նամակներ</button>}{messages.map(m=><div key={m.id} className={"ch-message "+(m.sender_id===userId?"mine":"")}><p>{m.body}</p><small>{new Date(m.created_at).toLocaleTimeString("hy-AM",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Yerevan"})}</small></div>)}<div ref={bottom}/></div>{active&&<form className="ch-message-form" onSubmit={send}><input aria-label="Նամակ" value={text} onChange={e=>setText(e.target.value)} maxLength={4000} required placeholder="Գրիր հաղորդագրություն…"/><button disabled={busy||!text.trim()}>➤</button></form>}</div></section>
}
