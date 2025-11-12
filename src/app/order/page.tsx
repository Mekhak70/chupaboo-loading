"use client";

import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./DogCakeOrderForm.module.css";

type Lang = "hy" | "en" | "ru";

export default function DogCakeOrderForm() {
  const [lang, setLang] = useState<Lang>("hy");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const t: Record<
    Lang,
    {
      title: string;
      customer: string;
      animalInfo: string;
      cakeInfo: string;
      delivery: string;
      send: string;
      confirmation: string;
      labels: Record<string, string>;
    }
  > = {
    hy: {
      title: "🎂 Տորթի պատվեր",
      customer: "👤 Հաճախորդի տվյալներ",
      animalInfo: "🐾 Կենդանու մասին",
      cakeInfo: "🍰 Տորթի տվյալներ",
      delivery: "🚚 Առաքման ինֆորմացիա",
      send: "Ուղարկել պատվերը",
      confirmation: "Ձեր պատվերն հաջողությամբ ուղարկվել է! 🐶",
      labels: {
        fullName: "Անուն, ազգանուն *",
        phone: "Հեռախոսահամար *",
        email: "Էլ. հասցե",
        animalName: "Կենդանու անունը *",
        animalAge: "Տարիքը կամ տարեդարձի օրը",
        allergies: "Ալերգիաներ (օր. չի կարող ուտել հավ)",
        health: "Առողջական խնդիրներ կամ զգայունություններ",
        preferences: "Սննդային նախընտրություններ կամ արգելքներ",
        species: "Տեսակը / ցեղը",
        photo: "Նկար (կենդանու կամ տորթի օրինակ)",
        cakeType: "Տորթի տեսակը *",
        cakeSize: "Տորթի չափը *",
        notes: "Նշումներ (գույն, գրություն և այլն)",
        address: "Առաքման հասցե *",
        deliveryDate: "Առաքման օր",
        deliveryTime: "Առաքման ժամ",
        extra: "Լրացուցիչ նշումներ",
      },
    },
    en: {
      title: "🎂 Cake Order",
      customer: "👤 Customer Details",
      animalInfo: "🐾 About the Animal",
      cakeInfo: "🍰 Cake Details",
      delivery: "🚚 Delivery Info",
      send: "Submit Order",
      confirmation: "Your order has been successfully sent! 🐶",
      labels: {
        fullName: "Full Name *",
        phone: "Phone Number *",
        email: "Email",
        animalName: "Animal’s Name *",
        animalAge: "Age or Birthday",
        allergies: "Allergies (e.g. cannot eat chicken)",
        health: "Health Issues or Sensitivities",
        preferences: "Dietary Preferences or Restrictions",
        species: "Species / Breed",
        photo: "Photo (animal or cake example)",
        cakeType: "Cake Type *",
        cakeSize: "Cake Size *",
        notes: "Notes (color, text, etc.)",
        address: "Delivery Address *",
        deliveryDate: "Delivery Date",
        deliveryTime: "Delivery Time",
        extra: "Additional Notes",
      },
    },
    ru: {
      title: "🎂 Заказ торта",
      customer: "👤 Данные клиента",
      animalInfo: "🐾 О животном",
      cakeInfo: "🍰 О торте",
      delivery: "🚚 Доставка",
      send: "Отправить заказ",
      confirmation: "Ваш заказ успешно отправлен! 🐶",
      labels: {
        fullName: "Имя и фамилия *",
        phone: "Телефон *",
        email: "Эл. почта",
        animalName: "Имя животного *",
        animalAge: "Возраст или день рождения",
        allergies: "Аллергии (например, нельзя курицу)",
        health: "Проблемы со здоровьем или чувствительность",
        preferences: "Пищевые предпочтения или ограничения",
        species: "Вид / порода",
        photo: "Фото (животного или торта)",
        cakeType: "Тип торта *",
        cakeSize: "Размер торта *",
        notes: "Примечания (цвет, надпись и т.д.)",
        address: "Адрес доставки *",
        deliveryDate: "Дата доставки",
        deliveryTime: "Время доставки",
        extra: "Дополнительные примечания",
      },
    },
  };

  // Տորթի տեսակներ և չափեր
  const cakeTypes: Record<Lang, string[]> = {
    hy: ["Մրգային", "Բանջարեղենային", "Մսով"],
    en: ["Fruit", "Vegetable", "Meat"],
    ru: ["Фруктовый", "Овощной", "Мясной"],
  };

  const cakeSizes: Record<Lang, string[]> = {
    hy: ["12x12", "16x16"],
    en: ["12x12", "16x16"],
    ru: ["12x12", "16x16"],
  };

  useEffect(() => {
    const now = new Date();
    setDateValue(now.toISOString().slice(0, 10));
    setTimeValue(now.toTimeString().slice(0, 5));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setPreviewSrc(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error(
        lang === "hy"
          ? "Խնդրում ենք ընտրել միայն նկար ֆայլ (jpg, png, webp, gif):"
          : lang === "en"
          ? "Please select an image file (jpg, png, webp, gif)."
          : "Пожалуйста, выберите изображение (jpg, png, webp, gif)."
      );
      e.target.value = "";
      setPreviewSrc(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreviewSrc(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);

    const requiredFields = ["fullName", "phone", "animalName", "cakeType", "cakeSize", "address"];
    for (const f of requiredFields) {
      const val = form.get(f)?.toString().trim();
      if (!val) {
        toast.error(
          lang === "hy"
            ? "Խնդրում ենք լրացնել պարտադիր դաշտերը՝ նշված * նշանով։"
            : lang === "en"
            ? "Please fill in all required fields marked with *."
            : "Пожалуйста, заполните все обязательные поля, отмеченные *."
        );
        return;
      }
    }

    const email = form.get("email")?.toString().trim() || "";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(
        lang === "hy"
          ? "Էլ․ հասցեն սխալ է։"
          : lang === "en"
          ? "Invalid email address."
          : "Неверный адрес электронной почты."
      );
      return;
    }

    const file = form.get("photo");
    if (file instanceof File && file.size > 0 && !file.type.startsWith("image/")) {
      toast.error(
        lang === "hy"
          ? "Կցված ֆայլը պետք է լինի նկար։"
          : lang === "en"
          ? "Attached file must be an image."
          : "Прикрепленный файл должен быть изображением."
      );
      return;
    }

    // Loading սկսում
    setIsSubmitting(true);

    const summary: Record<string, string> = {};
    form.forEach((v, k) => {
      if (typeof v === "string") summary[k] = v;
    });

    const textMessage = Object.entries(summary)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const sendData = new FormData();
    sendData.append("message", textMessage);
    if (file instanceof File && file.size > 0) sendData.append("photo", file);

    try {
      await fetch("/api/sendTelegram", { method: "POST", body: sendData });
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setIsSubmitting(false);
    }

    formEl.reset();
    setPreviewSrc(null);
    setDateValue("");
    setTimeValue("");
    setEmailError(null);

    toast.success(t[lang].confirmation);
    setShowModal(true);
    audioRef.current?.play().catch(console.error);

    setTimeout(() => {
      window.location.href = "https://www.instagram.com/chupabooo/";
    }, 3000);
  }

  const sections = [
    { title: t[lang].customer, fields: ["fullName", "phone", "email"] },
    {
      title: t[lang].animalInfo,
      fields: ["animalName", "animalAge", "allergies", "health", "preferences", "species", "photo"],
    },
    { title: t[lang].cakeInfo, fields: ["cakeType", "cakeSize", "notes"] },
    { title: t[lang].delivery, fields: ["address", "deliveryDate", "deliveryTime", "extra"] },
  ];

  return (
    <div className={styles.pageWrapper}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className={styles.container}>
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
                      : f === "phone"
                      ? "tel"
                      : "text";

                  return (
                    <div key={f} className={styles.field}>
                      <label className={styles.label} htmlFor={f}>
                        {label}
                      </label>

                      {isTextarea ? (
                        <textarea id={f} name={f} rows={3} className={styles.textarea} />
                      ) : f === "cakeType" ? (
                        <select id={f} name={f} className={styles.input} required defaultValue="">
                          <option value="" disabled>
                            {lang === "hy" ? "Ընտրեք տեսակը" : lang === "en" ? "Select type" : "Выберите тип"}
                          </option>
                          {cakeTypes[lang].map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      ) : f === "cakeSize" ? (
                        <select id={f} name={f} className={styles.input} required defaultValue="">
                          <option value="" disabled>
                            {lang === "hy" ? "Ընտրեք չափը" : lang === "en" ? "Select size" : "Выберите размер"}
                          </option>
                          {cakeSizes[lang].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
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
                            if (f === "email") {
                              const val = e.target.value;
                              setEmailError(
                                val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
                                  ? lang === "hy"
                                    ? "Էլ․ հասցեն սխալ է"
                                    : lang === "en"
                                    ? "Invalid email address"
                                    : "Неверный адрес электронной почты"
                                  : null
                              );
                            }
                          }}
                          onInput={(e) => {
                            const input = e.currentTarget;
                            if (["fullName", "animalName", "cakeType", "address"].includes(f)) {
                              input.value = input.value.replace(/[^ա-ֆԱ-Ֆa-zA-Z\s-]/g, "");
                              input.value = input.value.replace(/^\s+|\s+$/g, "");
                              input.value = input.value.replace(/\s+/g, " ");
                            }
                            if (f === "phone") input.value = input.value.replace(/[^0-9+]/g, "");
                            if (f === "cakeSize") input.value = input.value.replace(/[^0-9.]/g, "");
                          }}
                          className={styles.input}
                          required={["fullName", "phone", "animalName", "cakeType", "cakeSize", "address"].includes(f)}
                        />
                      )}

                      {f === "email" && emailError && <small className={styles.errorText}>{emailError}</small>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting
              ? lang === "hy"
                ? "Ուղարկվում է..."
                : lang === "en"
                ? "Submitting..."
                : "Отправка..."
              : t[lang].send}
          </button>
        </form>
      </div>

      <audio ref={audioRef} src="/sounds/dog-bark.mp3" />

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
