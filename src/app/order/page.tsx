"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./DogCakeOrderForm.module.css";

type Lang = "hy" | "en" | "ru";

export default function DogCakeOrderForm() {
    const [lang, setLang] = useState<Lang>("hy");
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [sound] = useState(new Audio("/dog-bark.mp3")); // շան հաչոցի ձայնը
    const [dateValue, setDateValue] = useState("");
    const [timeValue, setTimeValue] = useState("");
    const audioRef = useRef<HTMLAudioElement>(null);

    const t: Record<
        Lang,
        {
            title: string;
            customer: string;
            dogInfo: string;
            cakeInfo: string;
            delivery: string;
            send: string;
            confirmation: string;
            labels: Record<string, string>;
        }
    > = {
        hy: {
            title: "🎂 Շան տորթի պատվերի ձև",
            customer: "👤 Հաճախորդի տվյալներ",
            dogInfo: "🐶 Շան մասին",
            cakeInfo: "🍰 Տորթի տվյալներ",
            delivery: "🚚 Առաքման ինֆորմացիա",
            send: "Ուղարկել պատվերը",
            confirmation: "Ձեր պատվերն հաջողությամբ ուղարկվել է!",
            labels: {
                fullName: "Անուն, ազգանուն *",
                phone: "Հեռախոսահամար *",
                email: "Էլ. հասցե",
                dogName: "Շան անունը *",
                dogAge: "Շան տարիքը կամ տարեդարձի օրը",
                allergies: "Ալերգիաներ (օր. չի կարող ուտել հավ)",
                health: "Առողջական խնդիրներ կամ զգայունություններ",
                preferences: "Սննդային նախընտրություններ կամ արգելքներ",
                breed: "Շան ցեղը կամ չափսը",
                photo: "Նկար (շան կամ տորթի օրինակ)",
                cakeType: "Տորթի ձև / տեսակը *",
                cakeSize: "Տորթի քաշը կամ չափը *",
                notes: "Նշումներ (գույն, գրություն և այլն)",
                address: "Առաքման հասցե *",
                deliveryDate: "Առաքման օր",
                deliveryTime: "Առաքման ժամ",
                extra: "Լրացուցիչ նշումներ",
            },
        },
        en: {
            title: "🎂 Dog Cake Order Form",
            customer: "👤 Customer Details",
            dogInfo: "🐶 About the Dog",
            cakeInfo: "🍰 Cake Details",
            delivery: "🚚 Delivery Info",
            send: "Submit Order",
            confirmation: "Your order has been successfully sent!",
            labels: {
                fullName: "Full Name *",
                phone: "Phone Number *",
                email: "Email",
                dogName: "Dog’s Name *",
                dogAge: "Dog’s Age or Birthday",
                allergies: "Allergies (e.g. cannot eat chicken)",
                health: "Health Issues or Sensitivities",
                preferences: "Dietary Preferences or Restrictions",
                breed: "Dog’s Breed or Size",
                photo: "Photo (dog or cake example)",
                cakeType: "Cake Shape / Type *",
                cakeSize: "Cake Weight / Size *",
                notes: "Notes (color, text, candles, etc.)",
                address: "Delivery Address *",
                deliveryDate: "Delivery Date",
                deliveryTime: "Delivery Time",
                extra: "Additional Notes",
            },
        },
        ru: {
            title: "🎂 Форма заказа торта для собаки",
            customer: "👤 Данные клиента",
            dogInfo: "🐶 О собаке",
            cakeInfo: "🍰 О торте",
            delivery: "🚚 Доставка",
            send: "Отправить заказ",
            confirmation: "Ваш заказ успешно отправлен!",
            labels: {
                fullName: "Имя и фамилия *",
                phone: "Телефон *",
                email: "Эл. почта",
                dogName: "Имя собаки *",
                dogAge: "Возраст или день рождения",
                allergies: "Аллергии (например, нельзя курицу)",
                health: "Проблемы со здоровьем или чувствительность",
                preferences: "Пищевые предпочтения или ограничения",
                breed: "Порода или размер собаки",
                photo: "Фото (собаки или торта)",
                cakeType: "Тип / форма торта *",
                cakeSize: "Вес / размер торта *",
                notes: "Примечания (цвет, надпись и т.д.)",
                address: "Адрес доставки *",
                deliveryDate: "Дата доставки",
                deliveryTime: "Время доставки",
                extra: "Дополнительные примечания",
            },
        },
    };

    // Ավտոմատ լրացնենք այսօր ամսաթիվը և ժամը
    useEffect(() => {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const timeStr = now.toTimeString().slice(0, 5); // HH:MM
        setDateValue(dateStr);
        setTimeValue(timeStr);
    }, []);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        if (!file) {
            setPreviewSrc(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setPreviewSrc(String(reader.result));
        reader.readAsDataURL(file);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        const summary: Record<string, string> = {};
        form.forEach((v, k) => {
            summary[k] = typeof v === "string" ? v : (v as File).name ?? "";
        });

        // Telegram ուղարկում
        try {
            await fetch("/api/sendTelegram", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: Object.entries(summary)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join("\n"),
                }),
            });
        } catch (err) {
            console.error(err);
        }

        setShowModal(true);
        if (typeof window !== 'undefined') {
            const sound = new Audio('/sounds/dog-bark.mp3');
            sound.play();
          }
          


        e.currentTarget.reset();
        setPreviewSrc(null);
        const now = new Date();
        setDateValue(now.toISOString().slice(0, 10));
        setTimeValue(now.toTimeString().slice(0, 5));
    }

    const sections = [
        { title: t[lang].customer, fields: ["fullName", "phone", "email"] },
        {
            title: t[lang].dogInfo,
            fields: ["dogName", "dogAge", "allergies", "health", "preferences", "breed", "photo"],
        },
        { title: t[lang].cakeInfo, fields: ["cakeType", "cakeSize", "notes"] },
        { title: t[lang].delivery, fields: ["address", "deliveryDate", "deliveryTime", "extra"] },
    ];

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                {/* Language switcher */}
                <div className={styles.langRow}>
                    {["hy", "en", "ru"].map((l) => (
                        <button
                            key={l}
                            className={`${styles.langBtn} ${lang === l ? styles.langActive : ""}`}
                            onClick={() => setLang(l as Lang)}
                            type="button"
                        >
                            {l === "hy" ? "🇦🇲 Հայ" : l === "en" ? "🇬🇧 Eng" : "🇷🇺 Рус"}
                        </button>
                    ))}
                </div>

                <h1 className={styles.title}>{t[lang].title}</h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {sections.map((section) => (
                        <section key={section.title} className={styles.section}>
                            <h2 className={styles.sectionTitle}>{section.title}</h2>
                            <div className={styles.grid}>
                                {section.fields.map((f) => {
                                    const label = t[lang].labels[f];
                                    const isTextarea = ["allergies", "health", "preferences", "notes", "extra"].includes(f);
                                    const inputType =
                                        f === "email"
                                            ? "email"
                                            : f === "deliveryDate"
                                                ? "date"
                                                : f === "deliveryTime"
                                                    ? "time"
                                                    : f === "photo"
                                                        ? "file"
                                                        : "text";

                                    return (
                                        <div key={f} className={styles.field}>
                                            <label className={styles.label} htmlFor={f}>
                                                {label}
                                            </label>
                                            {isTextarea ? (
                                                <textarea id={f} name={f} rows={3} className={styles.textarea} />
                                            ) : inputType === "file" ? (
                                                <>
                                                    <input
                                                        id={f}
                                                        name={f}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className={styles.fileInput}
                                                    />
                                                    {previewSrc && <img src={previewSrc} alt="preview" className={styles.preview} />}
                                                </>
                                            ) : (
                                                <input
                                                    id={f}
                                                    name={f}
                                                    type={inputType}
                                                    value={f === "deliveryDate" ? dateValue : f === "deliveryTime" ? timeValue : undefined}
                                                    onChange={(e) => {
                                                        if (f === "deliveryDate") setDateValue(e.target.value);
                                                        if (f === "deliveryTime") setTimeValue(e.target.value);
                                                    }}
                                                    className={styles.input}
                                                    required={["fullName", "phone", "dogName", "cakeType", "cakeSize", "address"].includes(f)}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                    <button type="submit" className={styles.submitBtn}>
                        {t[lang].send}
                    </button>
                  

                </form>
            </div>

            {/* Modal */}
            {/* Modal */}
            {showModal && (
                <div className={styles.modal} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                            ×
                        </button>
                        <p>{t[lang].confirmation}</p>
                    </div>
                </div>
            )}

        </div>
    );
}
