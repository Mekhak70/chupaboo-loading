"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import Image from "next/image"
import Logo from "@/public/logo.svg"
import { usePathname } from "next/navigation"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const { t } = useLanguage()
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    // { href: "/shop", label: t("shop") },
    { href: "/contact", label: t("contact") },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src={Logo} alt="Chupaboo" width={230} priority /> 
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative pb-1 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "text-[#69429a]"
                      : "text-foreground/80 hover:text-primary"
                  }
                `}
              >
                {item.label}

                {/* Underline */}
                <span
                  className={`absolute left-0 -bottom-0.5 h-[2px] w-full rounded-full transition-all duration-300
                    ${
                      isActive
                        ? "bg-[#69429a] opacity-100"
                        : "bg-transparent opacity-0"
                    }
                  `}
                />
              </Link>
            )
          })}
          <LanguageSwitcher />
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {!isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {!isMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "text-[#69429a] bg-muted"
                        : "text-foreground/80 hover:bg-muted hover:text-primary"
                    }
                  `}
                >
                  {item.label}

                  {/* Mobile underline */}
                  {isActive && (
                    <span className="absolute bottom-1 left-4 right-4 h-[2px] rounded-full bg-[#69429a]" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
