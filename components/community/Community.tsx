"use client"

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import "./community.css"
import CommunityAccessGate from "./CommunityAccessGate"
import { petAge, validBirthday, yerevanToday } from "./pet-details"
import ReelVideo from "./ReelVideo"
import { ProfilePanel, SearchPanel, MessagesPanel, type SocialProfile } from "./SocialFeatures"

type Pet = { id: string; owner_id: string; name: string; species: string; birthday: string | null; breed: string; sex: string; bio: string; avatar_path: string }
type Post = { id: string; owner_id: string; pet_id: string; caption: string; image_path: string; created_at: string; media_kind: "image" | "video" }
type Comment = { id: string; user_id: string; body: string; created_at: string }
type Reward = { id: string; percent: number; kind: string; expires_at: string | null }
type Progress = { weeks: number[]; cycle: number; ends_at: string; verified: boolean; rewards: Reward[] }
const PAGE_SIZE = 12
const url = (path: string) => supabase.storage.from("community-images").getPublicUrl(path).data.publicUrl
const message = (error: unknown) => error && typeof error === "object" && "message" in error ? String(error.message) : "Գործողությունը չհաջողվեց։ Փորձիր կրկին։"
const date = (value: string) => new Date(value).toLocaleDateString("hy-AM", { timeZone: "Asia/Yerevan", month: "short", day: "numeric" })

async function upload(file: File, userId: string) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Ընտրիր JPG, PNG կամ WebP նկար։")
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error("Նկարի առավելագույն չափը 5 ՄԲ է։")
  const hashBuffer = await crypto.subtle.digest("SHA-256", await file.arrayBuffer())
  const hash = Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, "0")).join("")
  const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp"
  const path = `${userId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from("community-images").upload(path, file, { upsert: false, contentType: file.type })
  if (error) throw error
  return { path, hash }
}

async function uploadVideo(file: File, userId: string) {
  if (!["video/mp4","video/webm"].includes(file.type) || file.size > 25*1024*1024 || !file.size)
    throw new Error("Reels՝ MP4 կամ WebM, մինչև 25 ՄԲ։")
  const objectUrl = URL.createObjectURL(file)
  try {
    await new Promise<void>((resolve,reject) => {
      const video = document.createElement("video")
      const timer = setTimeout(() => { video.src = ""; reject(new Error("Տեսանյութը չհաջողվեց կարդալ։")) }, 15000)
      video.preload = "metadata"
      video.onloadedmetadata = () => {
        clearTimeout(timer)
        const valid = Number.isFinite(video.duration) && video.duration > 0 && video.duration <= 60
        video.src = ""
        if (valid) resolve(); else reject(new Error("Reels-ի առավելագույն տևողությունը 60 վայրկյան է։"))
      }
      video.onerror = () => { clearTimeout(timer); reject(new Error("Տեսանյութը չհաջողվեց կարդալ։")) }
      video.src = objectUrl
    })
  } finally { URL.revokeObjectURL(objectUrl) }
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer())
  const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,"0")).join("")
  const path = userId + "/" + crypto.randomUUID() + (file.type === "video/mp4" ? ".mp4" : ".webm")
  const r = await supabase.storage.from("community-videos").upload(path,file,{contentType:file.type,upsert:false})
  if (r.error) throw r.error
  return {path,hash}
}

export default function Community(props: { initialUsername?: string; initialSection?: CommunitySection } = {}) {
  return <CommunityAccessGate><CommunityContent {...props} /></CommunityAccessGate>
}
type CommunitySection = "feed" | "mine" | "rewards" | "reels" | "messages" | "search" | "profile"
function CommunityContent({ initialUsername, initialSection }: { initialUsername?: string; initialSection?: CommunitySection } = {}) {
  const router=useRouter()
  const pathname=usePathname()
  const communityBase="/"+pathname.split("/")[1]+"/community"
  const [userId, setUserId] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [pets, setPets] = useState<Record<string, Pet>>({})
  const [mine, setMine] = useState<Pet[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [counts, setCounts] = useState<Record<string, { likes: number; comments: number }>>({})
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<Progress | null>(null)
  const [tab, setTab] = useState<"feed" | "mine" | "rewards" | "reels" | "messages" | "search" | "profile">(initialUsername ? "profile" : initialSection ?? "feed")
  const [followingOnly, setFollowingOnly] = useState(false)
  const [peer, setPeer] = useState<string | null>(null)
  const [profileUsername, setProfileUsername] = useState<string | undefined>(initialUsername)
  const [authors, setAuthors] = useState<Record<string, SocialProfile>>({})
  const [postVideo, setPostVideo] = useState(false)
  const [singlePost, setSinglePost] = useState<string | null>(null)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [dialog, setDialog] = useState<"auth" | "pet" | "post" | null>(null)
  const [signUp, setSignUp] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [postPetId, setPostPetId] = useState("")
  const [resetPassword, setResetPassword] = useState(false)
  const revision = useRef(0)
  const mutationLock = useRef(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const requireUser = () => { if (userId) return true; setDialog("auth"); return false }

  useEffect(()=>{
    setTab(initialUsername ? "profile" : initialSection ?? "feed")
    setProfileUsername(initialUsername)
    const peerId=new URLSearchParams(window.location.search).get("peer")
    setPeer(peerId&&/^[0-9a-f-]{36}$/i.test(peerId)?peerId:null)
  },[initialUsername,initialSection,pathname])

  useEffect(() => {
    let mounted = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) { setUserId(session?.user.id ?? null); setAuthReady(true); if (_event === "PASSWORD_RECOVERY") setResetPassword(true) }
    })
    void supabase.auth.getSession().then(({ data, error }) => {
      if (mounted) { if (error) setError(message(error)); setUserId(data.session?.user.id ?? null); setAuthReady(true) }
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    let cancelled = false;
    const petId = new URLSearchParams(window.location.search).get("pet");
    if (!petId || !/^[0-9a-f-]{36}$/i.test(petId)) return;
    void supabase.from("community_pets").select("*").eq("id", petId).maybeSingle().then(({ data, error }) => {
      if (cancelled) return;
      if (error) setError(message(error));
      else if (data) setSelectedPet(data as Pet);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    void supabase.from("community_profiles").select("username").eq("user_id", userId).maybeSingle().then(({data,error}) => {
      if (cancelled) return;
      if (error) setError(message(error));
      else if (!data) { setTab("profile"); setProfileUsername(undefined); }
    });
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("post");
    if (id && /^[0-9a-f-]{36}$/i.test(id)) setSinglePost(id);
  }, []);

  useEffect(() => {
    if (!file) { setPreview(""); return }
    const objectUrl = URL.createObjectURL(file); setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  useEffect(() => {
    if (!dialog && !resetPassword) return
    const previous = document.activeElement as HTMLElement | null
    const root = modalRef.current
    const focusable = () => Array.from(root?.querySelectorAll<HTMLElement>('button,input,textarea,select,a[href]') ?? []).filter(el => !el.hasAttribute("disabled"))
    focusable()[0]?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !mutationLock.current) { setDialog(null); setResetPassword(false) }
      if (e.key === "Tab") { const items = focusable(); const first = items[0]; const last = items[items.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() } }
    }
    document.addEventListener("keydown", key)
    return () => { document.removeEventListener("keydown", key); previous?.focus() }
  }, [dialog, resetPassword])

  const load = useCallback(async (append = false, cursor?: Post) => {
    const run = ++revision.current
    setLoading(true); setError("")
    try {
      let query = supabase.from("community_posts").select("*").order("created_at", { ascending: false }).order("id", { ascending: false }).limit(PAGE_SIZE + 1)
      if (selectedPet) query = query.eq("pet_id", selectedPet.id)
      else if (tab === "mine") { if (!userId) { setPosts([]); setHasMore(false); return }; query = query.eq("owner_id", userId) }
      if (append && cursor) query = query.or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`)
      if (singlePost) query = query.eq("id", singlePost)
      else query = query.eq("media_kind", tab === "reels" ? "video" : "image")
      if (followingOnly && tab === "feed" && !singlePost && !selectedPet) {
        if (!userId) { setPosts([]); setHasMore(false); return }
        const followed: string[] = []
        for (let offset = 0; ; offset += 500) {
          const f = await supabase.from("community_follows").select("following_id").eq("follower_id", userId).order("following_id").range(offset, offset + 499)
          if (f.error) throw f.error
          followed.push(...(f.data ?? []).map(row => row.following_id))
          if (!f.data || f.data.length < 500) break
        }
        if (!followed.length) { setPosts([]); setHasMore(false); return }
        query = query.in("owner_id", followed)
      }
      const result = await query
      if (result.error) throw result.error
      const page = (result.data ?? []).slice(0, PAGE_SIZE) as Post[]
      const ids = page.map(p => p.id)
      const [petResult, countResult, likesResult, ownPets, rewardResult] = await Promise.all([
        page.length ? supabase.from("community_pets").select("*").in("id", [...new Set(page.map(p => p.pet_id))]) : Promise.resolve({ data: [], error: null }),
        ids.length ? supabase.rpc("community_post_counts", { p_ids: ids }) : Promise.resolve({ data: [], error: null }),
        userId && ids.length ? supabase.from("community_likes").select("post_id").eq("user_id", userId).in("post_id", ids) : Promise.resolve({ data: [], error: null }),
        userId ? supabase.from("community_pets").select("*").eq("owner_id", userId).order("created_at") : Promise.resolve({ data: [], error: null }),
        userId ? supabase.rpc("community_reward_status") : Promise.resolve({ data: null, error: null }),
      ])
      for (const result of [petResult, countResult, likesResult, ownPets, rewardResult]) if (result.error) throw result.error
      if (run !== revision.current) return
      const authorResult = page.length
        ? await supabase.from("community_profiles").select("*").in("user_id", [...new Set(page.map(p => p.owner_id))])
        : { data: [], error: null }
      if (authorResult.error) throw authorResult.error
      if (run !== revision.current) return
      setAuthors(previous => ({ ...(append ? previous : {}), ...Object.fromEntries((authorResult.data ?? []).map((p: SocialProfile) => [p.user_id, p])) }))
      setPosts(previous => append ? [...previous, ...page.filter(p => !previous.some(old => old.id === p.id))] : page)
      setHasMore((result.data?.length ?? 0) > PAGE_SIZE)
      const loadedPets = Object.fromEntries([...(petResult.data ?? []), ...(ownPets.data ?? [])].map((pet: Pet) => [pet.id, pet]))
      setPets(previous => append ? { ...previous, ...loadedPets } : loadedPets)
      setMine((ownPets.data ?? []) as Pet[])
      setProgress(rewardResult.data as Progress | null)
      const nextCounts = Object.fromEntries((countResult.data ?? []).map((c: { post_id: string; likes: number; comments: number }) => [c.post_id, { likes: Number(c.likes), comments: Number(c.comments) }]))
      setCounts(previous => append ? { ...previous, ...nextCounts } : nextCounts)
      setLiked(previous => new Set([...(append ? previous : []), ...(likesResult.data ?? []).map((l: { post_id: string }) => l.post_id)]))
    } catch (error) { if (run === revision.current) setError(message(error)) }
    finally { if (run === revision.current) setLoading(false) }
  }, [userId, tab, selectedPet, followingOnly, singlePost])

  useEffect(() => {
    setPosts([]); setLiked(new Set()); setMine([]); setProgress(null); setComments({}); setOpenComments(null)
    if (authReady && !["profile", "messages", "search"].includes(tab)) void load()
    else setLoading(false)
    return () => { revision.current += 1 }
  }, [authReady, load, tab])

  async function mutate(action: () => Promise<void>) {
    if (mutationLock.current) return
    mutationLock.current = true; setBusy(true); setError(""); setNotice("")
    try { await action() } catch (error) { setError(message(error)) }
    finally { mutationLock.current = false; setBusy(false) }
  }

  function openCompose() {
    if (!requireUser()) return
    setFile(null); setPostVideo(tab === "reels");
    void mutate(async () => {
      const r = await supabase.from("community_pets").select("*").eq("owner_id", userId!).order("created_at");
      if (r.error) throw r.error;
      const owned = (r.data ?? []) as Pet[];
      setMine(owned); setPostPetId(owned[0]?.id ?? ""); setDialog(owned.length ? "post" : "pet");
    })
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = new FormData(e.currentTarget)
    await mutate(async () => {
      if (resetPassword) {
        const result = await supabase.auth.updateUser({ password: String(form.get("password")) })
        if (result.error) throw result.error
        setResetPassword(false); setNotice("Գաղտնաբառը փոխված է։"); return
      }
      if (dialog === "auth") {
        const credentials = { email: String(form.get("email")).trim(), password: String(form.get("password")) }
        const result = signUp ? await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: window.location.origin + window.location.pathname } }) : await supabase.auth.signInWithPassword(credentials)
        if (result.error) throw result.error
        setDialog(null)
        setNotice(signUp && !result.data.session ? "Հաստատման նամակն ուղարկված է։ Ստուգիր էլ. փոստդ, հաստատիր և մուտք գործիր։" : "Բարի գալուստ Chupaboo 🐾")
        return
      }
      if (!userId || !file) throw new Error("Ընտրիր կենդանու նկարը։")
      const uploaded = dialog === "post" && postVideo ? await uploadVideo(file, userId) : await upload(file, userId)
      try {
        if (dialog === "pet") {
          if (!validBirthday(String(form.get("birthday")))) throw new Error("Նշիր ճիշտ ծննդյան օր, ամիս և տարի։");
          if (!String(form.get("breed")).trim()) throw new Error("Ցեղատեսակը պարտադիր է։");
          const result = await supabase.from("community_pets").insert({ name: String(form.get("name")).trim(), species: String(form.get("species")), breed: String(form.get("breed")).trim(), sex: String(form.get("sex") ?? "unknown"), birthday: String(form.get("birthday")) || null, bio: String(form.get("bio")).trim(), avatar_path: uploaded.path })
          if (result.error) throw result.error
        } else {
          const result = await supabase.from("community_posts").insert({ pet_id: postPetId, caption: String(form.get("caption")).trim(), image_path: uploaded.path, image_hash: uploaded.hash, media_kind: postVideo ? "video" : "image" })
          if (result.error) throw result.error
        }
      } catch (error) { await supabase.storage.from(dialog === "post" && postVideo ? "community-videos" : "community-images").remove([uploaded.path]); throw error }
      setDialog(null); setFile(null); setSelectedPet(null); setSinglePost(null); setTab(postVideo && dialog === "post" ? "reels" : "feed"); setNotice("Պահպանված է։ 🐾"); await load()
    })
  }

  async function toggleLike(post: Post) {
    if (!requireUser()) return
    await mutate(async () => {
      const result = liked.has(post.id) ? await supabase.from("community_likes").delete().eq("post_id", post.id).eq("user_id", userId!) : await supabase.from("community_likes").insert({ post_id: post.id })
      if (result.error) throw result.error
      const delta = liked.has(post.id) ? -1 : 1
      setLiked(previous => { const next = new Set(previous); if (delta < 0) next.delete(post.id); else next.add(post.id); return next })
      setCounts(previous => ({ ...previous, [post.id]: { likes: Math.max(0, (previous[post.id]?.likes ?? 0) + delta), comments: previous[post.id]?.comments ?? 0 } }))
    })
  }

  async function getComments(postId: string) {
    const result = await supabase.from("community_comments").select("id,user_id,body,created_at").eq("post_id", postId).order("created_at", { ascending: false }).limit(50)
    if (result.error) throw result.error
    setComments(previous => ({ ...previous, [postId]: (result.data ?? []).reverse() as Comment[] }))
  }

  async function report(postId: string | null, commentId: string | null) {
    if (!requireUser()) return
    const reason = window.prompt("Ի՞նչն է խնդիրը։ Նշիր առնվազն 3 նիշով։")
    if (!reason || reason.trim().length < 3) return
    await mutate(async () => {
      const result = await supabase.from("community_reports").insert({ post_id: postId, comment_id: commentId, reason: reason.trim().slice(0, 500) })
      if (result.error) throw result.error
      setNotice("Բողոքն ուղարկված է ադմինին։")
    })
  }

  return (
    <div className="ch-community">
      <div className="ch-shell">
        <aside className="ch-sidebar">
          <a className="ch-logo" href="#community-feed">chupaboo<span>social club 🐾</span></a>
          <p className="ch-tagline">Մեծ սեր՝ փոքրիկ թաթերի համար։</p>
          <nav aria-label="Համայնքի բաժիններ">{([['feed','⌂','Newsfeed'],['reels','▷','Reels'],['messages','✉','Նամակներ'],['search','⌕','Որոնում'],['profile','☺','Իմ էջը'],['mine','🐾','Կենդանիներ'],['rewards','✦','Պարգևներ']] as const).map(([key, icon, label]) => <button key={key} className={tab === key ? "ch-nav active" : "ch-nav"} onClick={() => { if (!["feed","reels","search"].includes(key) && !requireUser()) return; router.push(communityBase + "/" + (key === "mine" ? "pets" : key)) }}><span>{icon}</span>{label}</button>)}</nav>
          <button className="ch-primary" onClick={openCompose}>＋ Նոր հրապարակում</button>
          <div className="ch-sidebar-bottom"><p>Իրական կենդանիներ։<br />Իրական ընկերություն։</p>{userId ? <button className="ch-link" disabled={busy} onClick={() => void mutate(async () => { const { error } = await supabase.auth.signOut(); if (error) throw error; setTab("feed"); setSelectedPet(null); router.replace(communityBase+"/login") })}>Դուրս գալ</button> : <button className="ch-link" onClick={() => setDialog("auth")}>Մուտք / Գրանցում →</button>}</div>
        </aside>

        <main id="community-feed" className="ch-main">
          <header className="ch-topline"><span>CHUPABOO COMMUNITY</span><span className="ch-live">● Միասին ավելի ուրախ է</span></header>
          {tab === "feed" && !selectedPet && !singlePost && <section className="ch-intro"><div><span className="ch-eyebrow">ԲԱՐԻ ԳԱԼՈՒՍՏ ՄԵՐ ՈՀՄԱԿ</span><h1>Ամեն թաթ ունի<br /><em>իր պատմությունը։</em></h1><p>Ծանոթացիր, կիսվիր քո կենդանու փոքրիկ ուրախություններով և միասին ստեղծեք նոր հիշողություններ։</p><button className="ch-dark" onClick={() => userId ? openCompose() : setDialog("auth")}>{userId ? "Կիսվել մի պահով" : "Միանալ համայնքին"} ↗</button></div><div className="ch-hero-art" aria-hidden="true"><span className="ch-big-paw">🐾</span><span className="ch-note">մեր սիրելի<br />փոքրիկ աշխարհը ♡</span></div></section>}
          {error && <div role="alert" className="ch-alert">{error}<button onClick={() => void load()}>Կրկին փորձել</button></div>}
          {notice && <div role="status" className="ch-notice">{notice}<button aria-label="Փակել հաղորդագրությունը" onClick={() => setNotice("")}>×</button></div>}
          <div className="ch-section-title"><h2>{selectedPet ? selectedPet.name : tab === "mine" ? "Իմ կենդանիները" : tab === "rewards" ? "Իմ պարգևները" : tab === "reels" ? "Reels" : tab === "messages" ? "Անձնական նամակներ" : tab === "search" ? "Որոնում" : tab === "profile" ? "Անձնական էջ" : "Փոքրիկ պահեր, մեծ երջանկություն"}</h2><button className="ch-link" disabled={loading} onClick={() => void load()}>Թարմացնել ↻</button></div>
          {tab === "profile" && !selectedPet && <ProfilePanel key={String(userId) + String(profileUsername)} userId={userId} username={profileUsername} onLogin={() => setDialog("auth")} onMessage={id => router.push(communityBase+"/messages?peer="+id)} onPet={pet => { setSelectedPet(pet); setTab("feed") }} />}
          {tab === "search" && <SearchPanel />}
          {tab === "messages" && <MessagesPanel userId={userId} peer={peer} onLogin={() => setDialog("auth")} />}
          {tab === "feed" && !selectedPet && !singlePost && <div className="ch-feed-tabs"><button className={!followingOnly ? "active" : ""} onClick={() => setFollowingOnly(false)}>Բոլորը</button><button className={followingOnly ? "active" : ""} onClick={() => { if (requireUser()) setFollowingOnly(true) }}>Հետևվողները</button></div>}
          {singlePost && <button className="ch-link" onClick={() => setSinglePost(null)}>← Բոլոր հրապարակումները</button>}
          {selectedPet && <section className="ch-profile"><img src={url(selectedPet.avatar_path)} alt={selectedPet.name} /><div><h2>{selectedPet.name}</h2><p>{selectedPet.species === "dog" ? "Շուն" : selectedPet.species === "cat" ? "Կատու" : "Կենդանի"}{selectedPet.birthday ? ` · Ծնունդ՝ ${date(selectedPet.birthday)}` : ""}</p><p>{selectedPet.breed}{selectedPet.birthday ? " · " + petAge(selectedPet.birthday) : ""}</p><p>{selectedPet.bio}</p></div><button className="ch-link" onClick={() => setSelectedPet(null)}>← Հետ</button></section>}
          {tab === "mine" && !selectedPet && <div className="ch-pet-grid">{mine.map(pet => <button key={pet.id} className="ch-pet-card" onClick={() => setSelectedPet(pet)}><img src={url(pet.avatar_path)} alt={pet.name} /><strong>{pet.name}</strong><span>{pet.bio || "Իմ փոքրիկ ընկերը"}</span></button>)}<button className="ch-pet-card ch-add" onClick={() => { setFile(null); setDialog("pet") }}><span>＋</span>Ավելացնել կենդանի</button></div>}
          {tab === "rewards" && progress && <section className="ch-rewards"><h3>Քո ակտիվությունը՝ այս 28 օրում</h3><p>Յուրաքանչյուր 7-օրյա հատվածում առնվազն մեկ հրապարակում։ Շրջանն ավարտվում է՝ {date(progress.ends_at)}։</p><div className="ch-weeks">{[0,1,2,3].map(week => <div key={week} className={progress.weeks.includes(week) ? "done" : ""}><b>{progress.weeks.includes(week) ? "✓" : "🐾"}</b><span>Շաբաթ {week + 1}</span></div>)}</div><p>Լրացված է {progress.weeks.length} / 4 շաբաթ։</p>{!progress.verified && <p>5% պարգևը ստանալու համար հաստատիր էլ. փոստդ և լրացրու կենդանու պրոֆիլը։</p>}<div className="ch-coupons">{progress.rewards.map(reward => <article key={reward.id}><strong>{reward.percent}%</strong><div><h3>{reward.kind === "welcome" ? "Բարի գալուստի պարգև" : "Ակտիվության պարգև"}</h3><p>{reward.expires_at ? `Մինչև ${date(reward.expires_at)}` : "Առաջին գնումի համար"}</p></div></article>)}</div><p className="ch-muted">Պարգևները գրանցվում են քո հաշվին։ Գնումներին կիրառումը կմիանա checkout-ի ինտեգրումից հետո։ Զեղչերը չեն գումարվում։</p></section>}
          {["feed","mine","reels"].includes(tab) && <>
            <div className={tab === "reels" ? "ch-feed ch-reels" : "ch-feed"}>{posts.map(post => { const pet = pets[post.pet_id]; return <article className="ch-post" key={post.id}><header><button className="ch-post-author" onClick={() => pet && setSelectedPet(pet)}>{pet && <img src={url(pet.avatar_path)} alt="" />}<span><strong>{pet?.name ?? "Փոքրիկ ընկեր"}</strong><small>{date(post.created_at)} · Chupaboo ընտանիք</small></span></button><div>{post.owner_id === userId ? <button className="ch-icon" aria-label="Ջնջել հրապարակումը" disabled={busy} onClick={() => { if (!window.confirm("Ջնջե՞լ հրապարակումը։ Սա կարող է փոխել շաբաթվա առաջընթացը։")) return; void mutate(async () => { const result = await supabase.from("community_posts").delete().eq("id", post.id); if (result.error) throw result.error; await supabase.storage.from(post.media_kind === "video" ? "community-videos" : "community-images").remove([post.image_path]); await load() }) }}>×</button> : <button className="ch-icon" aria-label="Բողոքարկել հրապարակումը" onClick={() => void report(post.id, null)}>⚑</button>}</div></header>{post.media_kind === "video" ? <ReelVideo src={supabase.storage.from("community-videos").getPublicUrl(post.image_path).data.publicUrl} label={post.caption || "Reel"} /> : <img className="ch-post-image" src={url(post.image_path)} alt={post.caption || `${pet?.name ?? "Կենդանի"}՝ համայնքում`} loading="lazy" />}<div className="ch-post-actions"><button className={liked.has(post.id) ? "is-liked" : ""} aria-pressed={liked.has(post.id)} aria-label="Հավանել" disabled={busy} onClick={() => void toggleLike(post)}>{liked.has(post.id) ? "♥" : "♡"} <small>{counts[post.id]?.likes ?? 0}</small></button><button aria-label="Մեկնաբանություններ" disabled={busy} onClick={() => void mutate(async () => { if (openComments === post.id) setOpenComments(null); else { await getComments(post.id); setOpenComments(post.id) } })}>☏ <small>{counts[post.id]?.comments ?? 0}</small></button><button className="ch-share" aria-label="Պատճենել կենդանու էջի հղումը" onClick={() => void mutate(async () => { await navigator.clipboard.writeText(window.location.origin + window.location.pathname + `?pet=${post.pet_id}`); setNotice("Հղումը պատճենված է։") })}>↗</button></div><p className="ch-caption">{authors[post.owner_id] && <a className="ch-author-link" href={window.location.pathname.split("/").slice(0,2).join("/") + "/community/u/" + authors[post.owner_id].username}>@{authors[post.owner_id].username}</a>}<strong>{pet?.name}</strong> {post.caption}</p>{openComments === post.id && <div className="ch-comments">{(comments[post.id] ?? []).map(comment => <div key={comment.id}><p><strong>{comment.user_id === userId ? "Դու" : "Համայնքի անդամ"}</strong> {comment.body}</p><button className="ch-link" onClick={() => void report(null, comment.id)}>Բողոքարկել</button>{comment.user_id === userId && <button className="ch-link" disabled={busy} onClick={() => void mutate(async () => { const result = await supabase.from("community_comments").delete().eq("id", comment.id); if (result.error) throw result.error; await getComments(post.id); setCounts(c => ({ ...c, [post.id]: { likes: c[post.id]?.likes ?? 0, comments: Math.max(0, (c[post.id]?.comments ?? 0) - 1) } })) })}>Ջնջել</button>}</div>)}<form onSubmit={e => { e.preventDefault(); if (!requireUser()) return; const form = e.currentTarget; const body = String(new FormData(form).get("comment")).trim(); if (!body) return; void mutate(async () => { const result = await supabase.from("community_comments").insert({ post_id: post.id, body }); if (result.error) throw result.error; form.reset(); await getComments(post.id); setCounts(c => ({ ...c, [post.id]: { likes: c[post.id]?.likes ?? 0, comments: (c[post.id]?.comments ?? 0) + 1 } })) }) }}><input aria-label="Մեկնաբանություն" name="comment" required maxLength={1000} placeholder="Գրիր մի լավ խոսք…" /><button disabled={busy}>Ուղարկել</button></form></div>}</article> })}</div>
            {loading && <p role="status" className="ch-empty">Բեռնում ենք փոքրիկ պատմությունները…</p>}
            {!loading && !posts.length && !error && <div className="ch-empty"><span>🐾</span><h3>Առաջին պատմությունը դեռ առջևում է</h3><p>Կիսվիր քո կենդանու լուսանկարով և բացիր համայնքի պատմությունը։</p><button className="ch-primary" onClick={openCompose}>Ավելացնել հրապարակում</button></div>}
            {hasMore && <button className="ch-more" disabled={loading} onClick={() => void load(true, posts[posts.length - 1])}>Տեսնել ավելին ↓</button>}
          </>}
        </main>

        <aside className="ch-right"><div className="ch-perks"><span>ՓՈՔՐԻԿ ՔԱՅԼԵՐ, ՔԱՂՑՐ ՊԱՐԳԵՎՆԵՐ</span><h2>Լավ պահերը<br />վերադառնում են։</h2><article><b>5%</b><p>Գրանցվիր ու լրացրու կենդանու պրոֆիլը։</p></article><article><b>10%</b><p>Չորս շաբաթ շարունակ՝ շաբաթական մեկ պոստ։</p></article><button className="ch-link" onClick={() => { if (requireUser()) { setSelectedPet(null); setTab("rewards") } }}>Իմ առաջընթացը →</button></div><div className="ch-guidelines"><h3>Մեր փոքրիկ համաձայնությունը ♡</h3><p>Եղիր բարի։ Հրապարակիր քո կամ թույլտվությամբ նկարներ։ Մի հրապարակիր մարդկանց անձնական տվյալները։</p><small>Նկարներն ու կենդանու պրոֆիլները հանրային են։</small></div></aside>
      </div>
      {(dialog || resetPassword) && <div className="ch-overlay"><div className="ch-modal" role="dialog" aria-modal="true" aria-labelledby="ch-dialog-title" ref={modalRef}><button className="ch-close" aria-label="Փակել" disabled={busy} onClick={() => { setDialog(null); setResetPassword(false); setFile(null) }}>×</button><span className="ch-eyebrow">CHUPABOO SOCIAL CLUB</span><h2 id="ch-dialog-title">{resetPassword ? "Նոր գաղտնաբառ" : dialog === "auth" ? signUp ? "Բարի գալուստ մեր ընտանիք 🐾" : "Ուրախ ենք քեզ կրկին տեսնել" : dialog === "pet" ? "Ծանոթացրու քո փոքրիկին" : "Մի փոքրիկ պատմություն"}</h2>{error && <p role="alert" className="ch-form-error">{error}</p>}<form onSubmit={submit}>
        {resetPassword ? <label>Նոր գաղտնաբառ<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label> : dialog === "auth" ? <><label>Էլ. փոստ<input name="email" type="email" autoComplete="email" required /></label><label>Գաղտնաբառ<input name="password" type="password" minLength={8} autoComplete={signUp ? "new-password" : "current-password"} required /></label><p className="ch-muted">Պրոֆիլի և պոստերի նկարները տեսանելի են համայնքի բոլոր այցելուներին։</p></> : <>
          {dialog === "pet" ? <><label>Կենդանու անունը<input name="name" maxLength={60} required /></label><div className="ch-form-row"><label>Տեսակ<select name="species"><option value="dog">Շուն</option><option value="cat">Կատու</option><option value="other">Այլ</option></select></label><label>Ծննդյան օր / ամիս / տարի *<input name="birthday" type="date" max={yerevanToday()} required /></label></div><label>Ցեղատեսակ *<input name="breed" maxLength={100} required placeholder="Ցեղատեսակ կամ խառնածին" /></label><label>Սեռ<select name="sex"><option value="unknown">Չնշել</option><option value="male">Արու</option><option value="female">Էգ</option></select></label><label>Մի քանի բառ քո կենդանու մասին<textarea name="bio" maxLength={500} rows={2} /></label></> : <><label>Ո՞վ է պատմության հերոսը<select value={postPetId} onChange={e => setPostPetId(e.target.value)} required>{mine.map(pet => <option key={pet.id} value={pet.id}>{pet.name}</option>)}</select></label><label>Ի՞նչ եք արել այսօր<textarea name="caption" maxLength={2000} rows={3} placeholder="Մի փոքրիկ ուրախություն…" /></label></>}
          {dialog === "post" && <div className="ch-feed-tabs"><button type="button" className={!postVideo ? "active" : ""} onClick={() => { setPostVideo(false); setFile(null) }}>Լուսանկար</button><button type="button" className={postVideo ? "active" : ""} onClick={() => { setPostVideo(true); setFile(null) }}>Reel</button></div>}
          <label className="ch-upload">{preview && postVideo && dialog === "post" ? <video src={preview} controls playsInline style={{maxHeight:180,maxWidth:"100%"}} /> : preview ? <img src={preview} alt="Ընտրված նկարի նախադիտում" /> : <span>＋ Ընտրիր լուսանկար<br /><small>{postVideo && dialog === "post" ? "MP4, WebM · մինչև 25 ՄԲ, 60 վրկ" : "JPG, PNG, WebP · մինչև 5 ՄԲ"}</small></span>}<input key={String(postVideo) + dialog} type="file" accept={postVideo && dialog === "post" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"} required onChange={e => setFile(e.target.files?.[0] ?? null)} /></label>
        </>}
        <button className="ch-primary" disabled={busy || (!authReady && dialog !== "auth")}>{busy ? "Պահպանում ենք…" : resetPassword ? "Պահպանել գաղտնաբառը" : dialog === "auth" ? signUp ? "Ստեղծել հաշիվ" : "Մուտք գործել" : dialog === "pet" ? "Ստեղծել պրոֆիլ" : "Հրապարակել"}</button>
      </form>{dialog === "auth" && !resetPassword && <><button className="ch-link" onClick={() => setSignUp(value => !value)}>{signUp ? "Արդեն հաշիվ ունե՞ս։ Մուտք գործիր" : "Նո՞ր ես այստեղ։ Գրանցվիր"}</button><button className="ch-link" disabled={busy} onClick={() => { const email = window.prompt("Մուտքագրիր քո էլ. փոստը։"); if (email) void mutate(async () => { const result = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + window.location.pathname }); if (result.error) throw result.error; setNotice("Եթե հաշիվը գոյություն ունի, վերականգնման նամակն ուղարկված է։"); setDialog(null) }) }}>Մոռացե՞լ ես գաղտնաբառը</button></>}</div></div>}
    </div>
  )
}
