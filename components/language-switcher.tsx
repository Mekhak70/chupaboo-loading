"use client"

import { useRouter, usePathname } from "next/navigation"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/components/language-provider"

const languages = [
  { code: "hy" as const, label: "Հայերեն", flag: "🇦🇲" },
  { code: "en" as const, label: "English", flag: "🇬🇧" },
  { code: "ru" as const, label: "Русский", flag: "🇷🇺" },
  { code: "pl" as const, label: "Polski", flag: "🇵🇱" },
]

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()

  const currentLanguage = languages.find((l) => l.code === language)

  // --- Պահանջվող ֆունկցիան --- 
  const changeLanguage = (code: typeof languages[number]["code"]) => {
    setLanguage(code)

    // բաժանել pathname-ը մասերի
    const parts = pathname.split("/").filter(Boolean)

    // եթե առաջին մասը լեզվի կոդ է, փոխել այն, եթե ոչ՝ ավելացնել
    if (languages.some(l => l.code === parts[0])) {
      parts[0] = code
    } else {
      parts.unshift(code)
    }

    const newUrl = "/" + parts.join("/") // օրինակ /en/about
    router.push(newUrl)
  }
  // --- Ֆունկցիան ավարտվեց --- 

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <span>{currentLanguage?.flag}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={language === lang.code ? "bg-muted font-semibold" : ""}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
