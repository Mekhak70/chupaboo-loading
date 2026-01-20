"use client"

import React, { useState } from "react"
import { Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/components/language-provider"
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa"

export default function ContactPage() {
  const { t } = useLanguage()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const onlyLetters = value.replace(/[^a-zA-Zա-ֆԱ-Ֆ\s]/g, "")
    setName(onlyLetters)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const onlyNumbers = value.replace(/\D/g, "")
    setPhone(onlyNumbers)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      name,
      phone,
      message: (e.currentTarget.message as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Failed")

      setIsSubmitted(true)
      setName("")
      setPhone("")
      e.currentTarget.reset()
    } catch (err) {
      console.error(err)
      alert(t('messages'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    { icon: Phone, label: t("phone"), value: "033775750", type: "phone" },
  ]

  const socialLinks = [
    { icon: FaWhatsapp, label: "WhatsApp", value: "033775750", type: "whatsapp" },
    { icon: FaTelegramPlane, label: "Telegram", value: "033775750", type: "telegram" },
  ]

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="py-16 text-center bg-gradient-to-br 
from-primary/5 
via-background 
to-secondary/10
">
        <h1 className="text-4xl font-extrabold" style={{ color: "#69429a" }}>
          {t("contactTitle")}
        </h1>
        <p className="mt-4 text-muted-foreground" style={{ color: "#69429a" }}>{t("contactText")}</p>
      </section>

      {/* CONTENT */}
      <section className="py-16">
        <div className="container mx-auto px-4 grid gap-12 lg:grid-cols-2">
          {/* FORM */}
          <div className="rounded-xl bg-card p-6 shadow-sm md:p-8">
            {isSubmitted ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-bold">{t("messageSent")}</h3>
                <Button
                  className="mt-6 cursor-pointer"
                  onClick={() => setIsSubmitted(false)}
                >
                  {t("sendAnother")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* NAME */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">{t("name")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={handleNameChange}
                    placeholder={t("name")}
                    required
                    className="cursor-pointer"
                  />
                </div>

                {/* PHONE */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">{t("phone")}</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    inputMode="numeric"
                    placeholder={t('phone')}
                    maxLength={9}
                    required
                    className="cursor-pointer"
                  />
                </div>

                {/* MESSAGE */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="message">{t("message")}</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    required
                    className="cursor-pointer"
                    placeholder={t("message")}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer"
                  style={{ backgroundColor: "#69429a", color: "#fff" }}
                >
                  {isSubmitting ? t("sending") : t("sendMessage")}
                </Button>
              </form>
            )}
          </div>

          {/* CONTACT LINKS */}
          <div className="flex flex-col gap-6 rounded-xl bg-card p-6 shadow-sm md:p-8">
            {[...contactInfo, ...socialLinks].map((info, i) => {
              let href = "#"

              if (info.type === "phone") href = `tel:${info.value}`
              if (info.type === "whatsapp") href = `https://wa.me/374${info.value}`
              if (info.type === "telegram") href = `https://t.me/+374${info.value}`

              return (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-primary/10 cursor-pointer"
                >
                  <div
                    className="h-12 w-12 flex items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: "#69429a" }}
                  >
                    <info.icon />
                  </div>
                  <div>
                    <div className="font-semibold">{info.label}</div>
                    <div className="text-primary">{info.value}</div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
