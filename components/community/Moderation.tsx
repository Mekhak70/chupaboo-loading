"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import "./community.css"

type Report = { id: string; reason: string; created_at: string; post_id: string | null; comment_id: string | null }
export default function Moderation() {
  const [reports, setReports] = useState<Report[]>([])
  const [allowed, setAllowed] = useState(false)
  const [status, setStatus] = useState("Ստուգում ենք հասանելիությունը…")
  const [busy, setBusy] = useState(false)
  const [content, setContent] = useState<Record<string, { image_path?: string; caption?: string; body?: string; is_hidden: boolean }>>({})
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const check = await supabase.rpc("community_is_admin")
        if (check.error) throw check.error
        if (!check.data) { if (!cancelled) setStatus("Այս բաժինը հասանելի է միայն ադմինին։"); return }
        const result = await supabase.from("community_reports").select("id,reason,created_at,post_id,comment_id").order("created_at", { ascending: false }).limit(100)
        if (result.error) throw result.error
        const rows = (result.data ?? []) as Report[]
        const postIds = [...new Set(rows.flatMap(r => r.post_id ? [r.post_id] : []))]
        const commentIds = [...new Set(rows.flatMap(r => r.comment_id ? [r.comment_id] : []))]
        const [posts, comments] = await Promise.all([
          postIds.length ? supabase.from("community_posts").select("id,image_path,caption,is_hidden").in("id", postIds) : Promise.resolve({ data: [], error: null }),
          commentIds.length ? supabase.from("community_comments").select("id,body,is_hidden").in("id", commentIds) : Promise.resolve({ data: [], error: null }),
        ])
        if (posts.error) throw posts.error
        if (comments.error) throw comments.error
        if (!cancelled) { setAllowed(true); setReports(rows); setContent(Object.fromEntries([...(posts.data ?? []), ...(comments.data ?? [])].map(item => [item.id, item]))); setStatus("") }
      } catch (error) { if (!cancelled) setStatus(error instanceof Error ? error.message : "Տվյալները չհաջողվեց բեռնել։") }
    }
    void load()
    return () => { cancelled = true }
  }, [])
  async function toggle(report: Report) {
    const id = report.post_id ?? report.comment_id
    if (!id || !content[id] || busy) return
    setBusy(true)
    try {
      const hidden = !content[id].is_hidden
      const result = await supabase.from(report.post_id ? "community_posts" : "community_comments").update({ is_hidden: hidden }).eq("id", id).select("id").single()
      if (result.error) throw result.error
      setContent(previous => ({ ...previous, [id]: { ...previous[id], is_hidden: hidden } }))
      setStatus(hidden ? "Թաքցված է համայնքից։" : "Կրկին տեսանելի է։")
    } catch { setStatus("Չհաջողվեց պահպանել։") } finally { setBusy(false) }
  }
  return <div className="ch-community"><main style={{ maxWidth: 850, padding: 24, margin: "auto" }}><h1>Համայնքի բողոքներ</h1><p role="status">{status}</p>{allowed && !reports.length && <p>Բողոքներ չկան։</p>}{allowed && reports.map(report => { const item = content[report.post_id ?? report.comment_id ?? ""]; return <article className="ch-rewards" key={report.id} style={{ marginBottom: 15 }}><p>{report.created_at.slice(0, 10)}</p><h3>{report.reason}</h3>{item?.image_path && <img src={supabase.storage.from("community-images").getPublicUrl(item.image_path).data.publicUrl} alt="Բողոքարկված հրապարակում" style={{ maxWidth: "100%", maxHeight: 250, objectFit: "contain" }} />}<p>{item?.caption ?? item?.body}</p><button className="ch-primary" disabled={busy || !item} onClick={() => void toggle(report)}>{item?.is_hidden ? "Վերադարձնել" : "Թաքցնել"}</button></article> })}<p className="ch-muted">Ցուցադրվում են վերջին 100 բողոքները։</p></main></div>
}
