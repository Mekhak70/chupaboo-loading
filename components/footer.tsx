"use client"

import Link from "next/link"
import { Instagram } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import Image from "next/image"
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa"
import Logo from '@/public/logoWhit.svg'
import chupaboooo from "@/public/chupaboooo.png"

export function Footer() {
  const { t } = useLanguage()

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    // { href: "/shop", label: t("shop") },
    { href: "/contact", label: t("contact") },
  ]

  return (
    <footer className="border-t border-border  text-primary-foreground" style={{ background: "#69429a" }}>
      <section >
  <Image src={chupaboooo} alt="Chupaboo" width={0} height={0} style={{ width: '100%', height: 'auto' }} />
</section>
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex  items-center justify-center rounded-full bg-primery">
                <Image src={Logo} alt="Chupaboo Logo"  color="red" width={230}/>
                
              </div>
              
            </Link>
            <p className="text-sm text-primary-foreground/80">{t("heroSubtext")}</p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">{t("home")}</h3>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-primary-foreground/80 transition-colors hover:text-secondary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">{t("followUs")}</h3>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/chupabooo/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
                aria-label="Instagram"
                style={{backgroundColor:'#FFF'}}
              >
                <Instagram className="h-5 w-5" />
              </a>

              <a
                href="https://wa.me/37433775750"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
                aria-label="WhatsApp"
                style={{backgroundColor:'#FFF'}}

              >
                <FaWhatsapp className="h-5 w-5" />
              </a>

              <a
                href="https://t.me/+37433775750"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
                aria-label="Telegram"
                style={{backgroundColor:'#FFF'}}
              >
                <FaTelegramPlane className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} Chupaboo. {t("allRightsReserved")}
        </div>
      </div>
    </footer>
  )
}
