"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Award, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import Shun from "@/public/shun.png"
import Cake from "@/public/cake.png"
import Paw from '@/public/paw.png'
import PetSlider from "@/components/PetSlider"
import Slider from "@/components/aboutSliter"
import Letf from "@/public/sirtLeft.png"
import Right from "@/public/sirtRight.png"
import reviews from "@/public/reviews.png"
import reviewMobile from "@/public/reviewMobile.png"
export default function AboutPage() {
  const { t } = useLanguage()

  const stats = [
    { icon: Heart, value: "5,000+", label: t("happyPets") },
    { icon: Award, value: "100%", label: t("petSafe") },
    { icon: Users, value: "3,000+", label: t("happyFamilies") },
  ]

  return (
    <div className="flex flex-col w-full" style={{ backgroundColor: '#f9f5ff' }}>
      {/* Video Hero */}
      <div className="flex items-center justify-center w-full" style={{ backgroundColor: 'rgb(105, 66, 154)' }}>
        <video
          src="/about.mov"
          autoPlay
          muted
          loop
          playsInline
          className="w-full object-cover h-[50vh]"
        />
      </div>

      {/* Hero Section */}
      <section className="" >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl" style={{ color: '#69429a', padding: '50px 0' }}>
              {t("aboutTitle")}
            </h1>
          </div>
        </div>
      </section>

      {/* Chupaboo Section */}
      <section className="chupaboo-section">
        <div className="chupaboo-container">
          <div className="text-block">
            <span>{t('chupabooIdea')} </span>
            <span>{t('loveAndCare')}</span>
          </div>

          <div className="text-block bold">
            <span>{t('ideaThatInspiredUs')}</span>
            <span>{t('joyOnly')}</span>
          </div>

          <Image src={Shun} alt="Shun" width={100} height={25} className="shun-image" />

          <div className="text-block">
            <span>{t('everywhereLoveAndCare')} </span>
            <span>{t('dailyJoyAndBirth')}</span>
            <span>{t('chupabooFillsTheGap')}</span>
          </div>

          <div className="text-block">
            <span>{t('ourCaringTeam')}</span>
            <span>{t('cakesAndTreats')}</span>
            <span>{t('sugarAndAdditiveFree')}</span>
          </div>

          <div className="text-block bold">
            <span>{t('everyAnimalDeservesLove')}</span>
            <span> {t('careAndWarmth')}</span>
          </div>
        </div>
      </section>

      {/* Happy Section */}
      <section className="happy-section big">
        <div className="happy-container">
          <Image src={Cake} alt="Cake" width={70} height={56} className="happy-img" />
          <div className="happy-text">
          <span>{t('ourHappyFriends')}</span>
          </div>
          <Image src={Paw} alt="Paw" width={70} height={56} className="happy-img" />
        </div>
      </section>
      <section className="happy-section-small">
        <div className="happy-container">
          <Image src={Cake} alt="Cake" width={25} height={22} className="happy-img" />
          <div className="happy-text">
            <span>{t('ourHappyFriends')}</span>
          </div>
          <Image src={Paw} alt="Paw" width={23} height={22} className="happy-img" />
        </div>
      </section>

      <section style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '52px', paddingTop: '35px' }}>
        <Slider />

      </section>

      <section className="happy-section big">
        <div className="happy-container">
          <Image src={Letf} alt="Cake" width={35} className="happy-img" />
          <div className="happy-text">
            <span>{t('CONTACTS')}</span>
          </div>
          <Image src={Right} alt="Paw" width={40} className="happy-img" />
        </div>
      </section>
      <section className="happy-section-small">
        <div className="happy-container">
          <Image src={Letf} alt="Cake" width={18} height={22} className="happy-img" />
          <div className="happy-text">
            <span>{t('CONTACTS')}</span>
          </div>
          <Image src={Right} alt="Paw" width={23} height={22} className="happy-img" />
        </div>
      </section>
      <section
        className="reviews-desktop"
        style={{ padding: '0 40px 50px 40px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundImage: `url(${reviews.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            width: 'calc(100vw - 80px)',
            height: '330px',
          }}
        />
      </section>

      <section
        className="reviews-mobile"
        style={{ padding: '0 40px 50px 40px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundImage: `url(${reviewMobile.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            width: 'calc(100vw - 80px)',
            height: '400px',
          }}
        />
      </section>

      <style jsx>{`
        /* Chupaboo Section */
        .chupaboo-section {
          padding: 0 200px;
        }
      .happy-section-small{
        display: none;
      }
        .chupaboo-container {
          width: 100%;
          background-color: rgba(0,0,0,0.03);
          border-radius: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 56px 75px;
          gap: 20px;
          text-align: center;
          font-size: 20px;
          color: #69429a;
        }

        .text-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .bold {
          font-weight: bold;
        }

        /* Happy Section */
        .happy-section {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 49px 0 35px 0;
        }

        .happy-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 17.5px;
          font-size: 21px;
          font-weight: bold;
          color: #69429a;
          flex-direction: row;
        }

        .happy-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.14em;
          text-align: center;
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
        }

        .happy-img {
          width: 70px;
          height: auto;
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .chupaboo-section {
            padding: 0 100px;
          }
          .chupaboo-container {
            padding: 40px 50px;
            font-size: 18px;
          }
          .happy-container {
            gap: 12px;
            font-size: 18px;
          }
          .happy-text {
            font-size: 1.5rem;
          }
          .happy-img {
            width: 50px;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .chupaboo-section {
            padding: 0 20px;
          }

          .chupaboo-container {
            padding: 30px 20px;
            font-size: 16px;
          }

          .happy-container {
            gap: 8px;
            font-size: 14px;
          }

          .happy-text {
            font-size: 1.2rem;
          }

          .happy-img {
            width: 25px; /* Պրոպորցիոնալ փոքրացում */
          }
          .big { display: none;}
          .happy-section-small {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 49px 0 35px 0;
        }
        }
        /* Default (Desktop) */
        .reviews-mobile {
          display: none;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .reviews-desktop {
            display: none;
          }

          .reviews-mobile {
            display: block;
          }
        }

      `}</style>
    </div>
  )
}
