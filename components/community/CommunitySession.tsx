"use client"
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

type Pet = { id:string;owner_id:string;name:string;species:string;breed:string;sex:string;birthday:string|null;bio:string;avatar_path:string }
type State = { user:User|null;status:"loading"|"signed-out"|"incomplete"|"ready"|"error";pets:Pet[];error:string;recovery:boolean }
const initial:State={user:null,status:"loading",pets:[],error:"",recovery:false}
const Context=createContext<(State&{refresh:()=>Promise<State>;clearRecovery:()=>void})|null>(null)
const message=(e:unknown)=>e&&typeof e==="object"&&"message"in e?String(e.message):"Չհաջողվեց ստուգել հաշիվը։"
export function CommunitySessionProvider({children}:{children:ReactNode}){
 const [state,setState]=useState<State>(initial)
 const version=useRef(0),mounted=useRef(false),recovering=useRef(false)
 const refresh=useCallback(async()=>{
  const run=++version.current
  if(mounted.current)setState(v=>({...initial,recovery:recovering.current}))
  let next:State=initial
  try{
   const account=await supabase.auth.getUser()
   if(account.error&&account.error.name!=="AuthSessionMissingError")throw account.error
   const user=account.data.user
   if(!user)next={...initial,status:"signed-out",recovery:recovering.current}
   else{
    const [ready,pets]=await Promise.all([
     supabase.rpc("community_ready"),
     supabase.from("community_pets").select("*").eq("owner_id",user.id).order("created_at"),
    ])
    if(ready.error)throw ready.error;if(pets.error)throw pets.error
    next={user,status:ready.data===true?"ready":"incomplete",pets:(pets.data??[])as Pet[],error:"",recovery:recovering.current}
   }
  }catch(error){next={...initial,status:"error",error:message(error),recovery:recovering.current}}
  if(mounted.current&&run===version.current)setState(next)
  return next
 },[])
 useEffect(()=>{
  mounted.current=true
  let timer:ReturnType<typeof setTimeout>|undefined
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{
   if(event==="PASSWORD_RECOVERY")recovering.current=true
   ++version.current
   setState({...initial,recovery:recovering.current})
   if(timer)clearTimeout(timer)
   timer=setTimeout(()=>{void refresh()},0)
  })
  void refresh()
  return()=>{mounted.current=false;version.current++;if(timer)clearTimeout(timer);subscription.unsubscribe()}
 },[refresh])
 const clearRecovery=()=>{recovering.current=false;setState(v=>({...v,recovery:false}))}
 return <Context.Provider value={{...state,refresh,clearRecovery}}>{children}</Context.Provider>
}
export function useCommunitySession(){
 const value=useContext(Context);if(!value)throw Error("CommunitySessionProvider is missing")
 return value
}
