export function yerevanToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date())
  const part = (type: string) => parts.find(p => p.type === type)?.value ?? ""
  return part("year") + "-" + part("month") + "-" + part("day")
}
export function petAge(birthday: string, today = yerevanToday()) {
  const [by,bm,bd]=birthday.split("-").map(Number)
  const [ty,tm,td]=today.split("-").map(Number)
  if(!by||!bm||!bd||birthday>today)return ""
  let months=(ty-by)*12+tm-bm-(td<bd?1:0)
  months=Math.max(0,months)
  const years=Math.floor(months/12),rest=months%12
  return years ? years+" տարեկան"+(rest?" "+rest+" ամսական":"") : months ? months+" ամսական" : "1 ամսականից փոքր"
}
export function validBirthday(value: string, today=yerevanToday()) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value>today)return false
  const d=new Date(value+"T12:00:00Z")
  return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value
}
