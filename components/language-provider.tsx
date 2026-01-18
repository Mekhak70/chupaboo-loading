"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "hy" | "en" | "ru" | "pl"

type Translations = {
  [key: string]: {
    hy: string
    en: string
    ru: string
    pl: string
  }
}

export const translations: Translations = {
  // Navigation
  home: { hy: "Գլխավոր", en: "Home", ru: "Главная", pl: "Strona główna" },
  about: { hy: "Մեր մասին", en: "About", ru: "О нас", pl: "O nas" },
  shop: { hy: "Խանութ", en: "Shop", ru: "Магазин", pl: "Sklep" },
  contact: { hy: "Կապ", en: "Contact", ru: "Контакты", pl: "Kontakt" },
  

  // Hero
  heroTitle: {
    hy: "Համեղ և անվտանգ տորթեր՝ ստեղծված ձեր սիրելի կենդանիների համար!",
    en: "Delicious Cakes for Your Beloved Pets!",
    ru: "Вкусные торты для ваших любимых питомцев!",
    pl: "Pyszne i bezpieczne torty dla Twoich ukochanych pupili!"
  },
  
  heroSubtext: {
    hy: "Կենդանիների համար անվտանգ, բնական բաղադրիչներով տորթեր՝ առանց շաքարի և հավելումների։",
    en: "Treat your furry friends with our handmade, pet-safe cakes.",
    ru: "Порадуйте своих пушистых друзей нашими домашними тортами.",
    pl: "Pociesz swoich futrzastych przyjaciół ręcznie robionymi, bezpiecznymi dla zwierząt tortami."
  },
  
  orderNow: { 
    hy: "Պատվիրել հիմա", 
    en: "Order Now", 
    ru: "Заказать",
    pl: "Zamów teraz" 
  },
  
  // About
  aboutTitle: { 
    hy: "ՄԵՐ ՄԱՍԻՆ", 
    en: "ABOUT US", 
    ru: "О НАС",
    pl: "O NAS" 
  },
  
  aboutText: {
    hy: "Մեզ համար կենդանիները ընտանիքի անդամներ են։ Այդ իսկ պատճառով յուրաքանչյուր տորթ պատրաստում ենք մեծ սիրով ու ուշադրությամբ՝ մտածելով նրանց առողջության և ուրախության մասին։ Մեր տորթերը ոչ միայն համեղ են, այլև անվտանգ ու օգտակար ձեր չորքոտանի ընկերների համար։",
    en: "We are passionate bakers creating healthy and delicious cakes for pets. Every cake is handcrafted with love and the finest ingredients suitable for dogs and cats.",
    ru: "Мы - увлечённые пекари, создающие здоровые и вкусные торты для питомцев.",
    pl: "Dla nas zwierzęta są członkami rodziny. Dlatego każdy tort przygotowujemy z miłością i uwagą, dbając o ich zdrowie i radość. Nasze torty są nie tylko smaczne, ale także bezpieczne i pożywne dla Twoich czworonożnych przyjaciół."
  },
  
  // Shop
  shopTitle: { 
    hy: "ՄԵՐ ՏՈՐԹԵՐԸ", 
    en: "SHOP OUR CAKES", 
    ru: "НАШИ ТОРТЫ",
    pl: "NASZE TORTY" 
  },
  
  
  shopDesc: {
    hy: "Մեր տորթերը ստեղծված են հատուկ կենդանիների համար՝ առանց շաքարի և հավելումների։",
    en: "Our cakes are specially made for pets, with no sugar or additives.",
    ru: "Наши торты созданы специально для животных, без сахара и добавок.",
    pl: "Nasze torty są tworzone specjalnie dla zwierząt, bez cukru i dodatków."
  },
  
  
  addToCart: { 
    hy: "Ավելացնել զամբյուղում", 
    en: "Add to Cart", 
    ru: "В корзину",
    pl: "Dodaj do koszyka" 
  },
  checkout: { 
    hy: "Վճարում", 
    en: "Checkout", 
    ru: "Оформить",
    pl: "Przejdź do kasy" 
  },
  cart: { 
    hy: "Զամբյուղ", 
    en: "Cart", 
    ru: "Корзина",
    pl: "Koszyk" 
  },
  allPets: { 
    hy: "Բոլոր տեսակները", 
    en: "All Types", 
    ru: "Все виды",
    pl: "Wszystkie rodzaje" 
  },
  meatBased: { 
    hy: "Մսային", 
    en: "Meat-based", 
    ru: "Мясные",
    pl: "Mięsne" 
  },
  vegetableBased: { 
    hy: "Բանջարեղանային", 
    en: "Vegetable-based", 
    ru: "Овощные",
    pl: "Warzywne" 
  },
  fruitBased: { 
    hy: "Մրգային", 
    en: "Fruit-based", 
    ru: "Фруктовые",
    pl: "Owocowe" 
  },
  

  customOrdersWelcome: { 
    hy: "Ընդունվում են անհատական պատվերներ!", 
    en: "Custom Orders Welcome!", 
    ru: "Принимаем индивидуальные заказы!",
    pl: "Przyjmujemy zamówienia indywidualne!" 
  },
  
  customOrdersDesc: {
    hy: "Ցանկանո՞ւմ եք յուրահատուկ տորթ։ Մենք սիրով պատրաստում ենք անհատական տորթեր յուրաքանչյուր առիթի համար՝ ցանկացած բաղադրությամբ և դիզայնով։ Կապվե՛ք մեզ հետ՝ ձեր գաղափարները քննարկելու համար։",
    en: "Looking for something special? We love creating custom cakes for birthdays, gotcha days, and other celebrations. Contact us to discuss your ideas!",
    ru: "Ищете что-то особенное? Мы с удовольствием создадим торт на заказ для дней рождения и других праздников.",
    pl: "Szukasz czegoś wyjątkowego? Z przyjemnością tworzymy torty na zamówienie na urodziny, 'gotcha day' i inne okazje. Skontaktuj się z nami, aby omówić swoje pomysły!"
  },  
  
  contactUs: { 
    hy: "ԿԱՊ ՀԱՍՏԱՏԵՔ ՄԵԶ ՀԵՏ", 
    en: "CONTACT US", 
    ru: "СВЯЗАТЬСЯ",
    pl: "SKONTAKTUJ SIĘ Z NAMI"
  },
  
  // Contact
  contactTitle: { 
    hy: "ԿԱՊ ՀԱՍՏԱՏԵՔ ՄԵԶ ՀԵՏ", 
    en: "CONTACT US", 
    ru: "СВЯЖИТЕСЬ С НАМИ",
    pl: "SKONTAKTUJ SIĘ Z NAMI"
  },
  
  CONTACTS: {
    hy: "ԿԱՐԾԻՔՆԵՐ",
    en: "REVIEWS",
    ru: "ОТЗЫВЫ",
    pl: "RECENZJE"
  },
  
  chupabooIdea: {
    hy: "Chupaboo–ն ստեղծվել է մի պարզ, բայց շատ կարևոր գաղափարի շուրջ",
    en: "Chupaboo was created around a simple yet deeply important idea —",
    ru: "Chupaboo был создан вокруг простой, но очень важной идеи -",
    pl: "Chupaboo powstało wokół prostej, ale bardzo ważnej idei —"
  },
  
  loveAndCare: {
    hy: "սեր և հոգատարություն կենդանիների հանդեպ։",
    en: "love and care for animals.",
    ru: "любовь и забота о животных.",
    pl: "miłość i troska o zwierzęta."
  },
  
  ideaThatInspiredUs: {
    hy: "Սա այն գաղափարն է, որը մեզ դրդեց ստեղծել մի բան,",
    en: "This idea inspired us to create something",
    ru: "Именно эта идея вдохновила нас на создание чего-то",
    pl: "Ta idea zainspirowała nas do stworzenia czegoś,"
  },
   
  joyOnly: {
    hy: "որը միայն ուրախության մասին է։",
    en: "that is purely about joy.",
    ru: "что существует исключительно ради радости.",
    pl: "który dotyczy wyłącznie radości."
  },
  
  everywhereLoveAndCare: {
    hy: "Թե՛ տանը, թե՛ դրսում, մեր փոքրիկ ընկերները ունեն նույն սիրո և ուշադրության",
    en: "Whether at home or outdoors, our little friends need the same love and attention",
    ru: "Дома или на улице, наши маленькие друзья нуждаютсяв той же любви и внимании,",
    pl: "Czy w domu, czy na zewnątrz, nasi mali przyjaciele potrzebują tej samej miłości i uwagi"
  },
  
  dailyJoyAndBirth: {
    hy: "կարիքը, որը նրանք մեզ տալիս են ամեն օր։ Հենց այդ պատճառով էլ ծնվեց",
    en: "they give us every day. That is why Chupaboo was born -",
    ru: "которые они дарят нам каждый день. Именно поэтому появился",
    pl: "które dają nam każdego dnia. Dlatego powstało Chupaboo –"
  },
  
  chupabooFillsTheGap: {
    hy: "Chupaboo–ն՝ լրացնելու այդ բացը։",
    en: "to fill that need.",
    ru: "Chupaboo — чтобы восполнить эту потребность.",
    pl: "aby wypełnić tę potrzebę."
  },
  
  ourCaringTeam: {
    hy: "Մեր հոգատար թիմը պատրաստում է կենդանիների համար նախատեսված",
    en: "Our caring team creates cakes and treats for animals",
    ru: "Наша заботливая команда готовит торты и лакомства для животных",
    pl: "Nasz troskliwy zespół przygotowuje torty i smakołyki dla zwierząt"
  },
  
  cakesAndTreats: {
    hy: "տորթեր և համովիկներ՝ ամբողջությամբ բնական բաղադրիչներից, առանց",
    en: "using only natural ingredients, ",
    ru: "исключительно из натуральных ингредиентов,",
    pl: "torty i smakołyki wykonane wyłącznie z naturalnych składników, bez"
  },
  
  sugarAndAdditiveFree: {
    hy: "շաքարի և առանց հավելումների։",
    en: "with no sugar and no additives.",
    ru: "без сахара и без каких-либо добавок.",
    pl: "cukru i dodatków."
  },
  
  everyAnimalDeservesLove: {
    hy: "Մենք հավատում ենք, որ յուրաքանչյուր կենդանի արժանի է սիրո,",
    en: "We believe that every animal deserves love,",
    ru: "Мы верим, что каждое животное заслуживает",
    pl: "Wierzymy, że każde zwierzę zasługuje na miłość,"
  },
  
  careAndWarmth: {
    hy: "ուշադրության և ընտանիքի ջերմությանը։",
    en: "care, and the warmth of a family.",
    ru: "любви, заботы и тепла семьи.",
    pl: "troskę i ciepło rodziny."
  },
  
  ourHappyFriends: {
    hy: "ՄԵՐ ԵՐՋԱՆԻԿ ԸՆԿԵՐՆԵՐԸ",
    en: "OUR HAPPY FRIENDS",
    ru: "НАШИ СЧАСТЛИВЫЕ ДРУЗЬЯ",
    pl: "NASI SZCZĘŚLIWI PRZYJACIELE"
  },
  
  
  contactText: {
    hy: "Ունե՞ք հարցեր կամ անհատական պատվերներ։ Կապ հաստատեք մեզ հետ։",
    en: "Have questions or custom orders? Get in touch!",
    ru: "Есть вопросы или индивидуальные заказы? Свяжитесь с нами!",
    pl: "Masz pytania lub indywidualne zamówienia? Skontaktuj się z nami!"
  },
  
  name: { hy: "Անուն", en: "Name", ru: "Имя", pl: "Imię" },
  email: { hy: "Էլ. հասցե", en: "Email", ru: "Эл. почта", pl: "Email" },
  message: { hy: "Հաղորդագրություն", en: "Message", ru: "Сообщение", pl: "Wiadomość" },
  sendMessage: { hy: "Ուղարկել", en: "Send Message", ru: "Отправить", pl: "Wyślij wiadomość" },
  sending: { hy: "Ուղարկվում է...", en: "Sending...", ru: "Отправка...", pl: "Wysyłanie..." },
  messageSent: { hy: "Հաղորդագրությունը ուղարկված է!", en: "Message Sent!", ru: "Сообщение отправлено!", pl: "Wiadomość wysłana!" },
  messageSentDesc: {
    hy: "Շնորհակալություն կապնվելու համար։ Մենք շուտով կպատասխանենք։",
    en: "Thank you for reaching out. We'll get back to you soon!",
    ru: "Спасибо за обращение. Мы скоро свяжемся с вами!",
    pl: "Dziękujemy za kontakt. Skontaktujemy się z Tobą wkrótce!"
  },
  sendAnother: { hy: "Ուղարկել մեկ այլ հաղորդագրություն", en: "Send Another Message", ru: "Отправить ещё", pl: "Wyślij kolejną wiadomość" },
  getInTouch: { hy: "Կապ հաստատեք", en: "Get in Touch", ru: "Связаться с нами", pl: "Skontaktuj się z nami" },
  address: { hy: "Հասցե", en: "Address", ru: "Адрес", pl: "Adres" },
  phone: { hy: "Հեռախոս", en: "Phone", ru: "Телефон", pl: "Telefon" },
  hours: { hy: "Աշխատանքային ժամեր", en: "Hours", ru: "Часы работы", pl: "Godziny pracy" },
  mapComingSoon: { hy: "Քարտեզը շուտով կհայտնվի", en: "Map Coming Soon", ru: "Карта скоро появится", pl: "Mapa wkrótce dostępna" }
  ,

  // FAQ
faq: { hy: "Հաճախ տրվող հարցեր", en: "Frequently Asked Questions", ru: "Часто задаваемые вопросы", pl: "Najczęściej zadawane pytania" },
faqCustomDesign: { hy: "Անհատական տորթեր պատրաստու՞մ եք։", en: "Do you offer custom cake designs?", ru: "Вы делаете торты на заказ?", pl: "Czy oferujecie torty na zamówienie?" },
faqCustomDesignAnswer: { hy: "Այո՛։ Մենք սիրով պատրաստում ենք անհատական տորթեր ձեր կենդանու հատուկ առիթների համար։ Կապնվեք մեզ հետ ձեր գաղափարներով։", en: "Yes! We love creating custom cakes for your pet's special occasions. Contact us with your ideas and we'll make it happen.", ru: "Да! Мы с удовольствием создадим торт для особого случая вашего питомца.", pl: "Tak! Uwielbiamy tworzyć torty na zamówienie na specjalne okazje Twojego zwierzaka. Skontaktuj się z nami z pomysłami, a my je zrealizujemy." },
faqOrderAdvance: { hy: "Մինչև քանի օր առաջ պետք է պատվիրեմ՞։", en: "How far in advance should I order?", ru: "За сколько дней нужно заказывать?", pl: "Na ile dni wcześniej powinienem złożyć zamówienie?" },
faqOrderAdvanceAnswer: { hy: "Առաջարկում ենք պատվիրել առնվազն 1-2 օր առաջ ստանդարտ տորթերի համար և 2-3 օր առաջ անհատական տորթերի համար։", en: "We recommend ordering at least 1-2 days in advance for standard cakes, and 2-3 days for custom designs.", ru: "Рекомендуем заказывать за 1-2 дней для стандартных тортов и за 2-3 дней для индивидуальных.", pl: "Zalecamy składanie zamówień co najmniej 1-2 dni wcześniej na standardowe torty i 2-3 dni wcześniej na torty na zamówienie." },
faqSafe: { hy: "Ձեր տորթերը անվտանգ են բոլոր կենդանիների համար՞։", en: "Are your cakes safe for all pets?", ru: "Ваши торты безопасны для всех питомцев?", pl: "Czy wasze torty są bezpieczne dla wszystkich zwierząt?" },
faqSafeAnswer: { hy: "Մեր տորթերը պատրաստված են վետերինարներ հաստատած բաղադրիչներից, որոնք անվտանգ են մեծ մասի շների և կատուների համար։ Եթե ձեր կենդանու ալերգիաներ կան, խնդրում ենք տեղեկացնել։", en: "Our cakes are made with vet-approved ingredients safe for most dogs and cats. If your pet has allergies, please let us know and we'll accommodate.", ru: "Наши торты сделаны из ингредиентов, одобренных ветеринарами, безопасных для большинства собак и кошек.", pl: "Nasze torty są wykonane ze składników zatwierdzonych przez weterynarzy, bezpiecznych dla większości psów i kotów. Jeśli Twój zwierzak ma alergie, prosimy o informację, a dostosujemy tort." },
faqDelivery: { hy: "Կա՞ անվճար առաքում և ինչպե՞ս է կազմակերպվում։", en: "Is delivery free and how is it arranged?", ru: "Есть ли бесплатная доставка и как она организована?", pl: "Czy dostawa jest bezpłatna i jak jest zorganizowana?" },
faqDeliveryAnswer: { hy: "Այո՛, Երևան քաղաքում առաքումը անվճար է։ Մարզերում առաքման գինը կախված է հեռավորությունից։", en: "Yes, delivery is free in the city of Yerevan! In regional areas, the delivery price depends on the distance.", ru: "Да, доставка в городе Ереван бесплатная! В регионах стоимость доставки зависит от расстояния.", pl: "Tak, dostawa w Erywaniu jest bezpłatna! W regionach koszt dostawy zależy od odległości." },

// Footer
followUs: { hy: "Հետևեք մեզ", en: "Follow Us", ru: "Подписывайтесь", pl: "Śledź nas" },
allRightsReserved: { hy: "Բոլոր իրավունքները պաշտպանված են", en: "All Rights Reserved", ru: "Все права защищены", pl: "Wszystkie prawa zastrzeżone" },

  // Features
  handmade: { hy: "Պատրաստված Է սիրով", en: "Handmade with Love", ru: "Сделано с любовью", pl: "Ręcznie wykonane z miłością" },
handmadeDesc: { hy: "Յուրաքանչյուր տորթ պատրաստվում է սիրով և մանրուքներին ուշադրություն դարձնելով։", en: "Each cake is crafted by hand with care and attention to detail.", ru: "Каждый торт сделан вручную с заботой и вниманием к деталям.", pl: "Każdy tort jest przygotowywany ręcznie z troską i dbałością o szczegóły." },
petSafe: { hy: "100% անվտանգ կենդանիների համար", en: "100% Pet Safe", ru: "100% безопасно", pl: "100% Bezpieczne dla zwierząt" },
petSafeDesc: { hy: "Կիրառում ենք միայն լավագույն, վետերինարներ հաստատած բաղադրիչներ ձեր փոքրիկ ընկերների համար։", en: "Only the finest, vet-approved ingredients for your furry friends.", ru: "Только лучшие ингредиенты, одобренные ветеринарами.", pl: "Używamy tylko najlepszych składników, zatwierdzonych przez weterynarzy, dla Twoich futrzastych przyjaciół." },
freshDaily: { hy: "Թարմ ամեն օր", en: "Fresh Daily", ru: "Свежие ежедневно", pl: "Świeże codziennie" },
freshDailyDesc: { hy: "Թխում ենք ամեն օր առավելագույն համի և որակի համար։", en: "Baked fresh every day for maximum taste and quality.", ru: "Выпекаем каждый день для максимального вкуса и качества.", pl: "Pieczenie codziennie dla maksymalnego smaku i jakości." },

// CTA
readyToTreat: { hy: "Պատրաստե՞լ ձեր կենդանու ուրախությանը։", en: "Ready to treat your pet?", ru: "Готовы порадовать питомца?", pl: "Gotowy, by sprawić radość swojemu zwierzakowi?" },
readyToTreatDesc: { hy: "Դիտեք մեր համեղ, կենդանիների համար անվտանգ տորթերի ընտրությունը։", en: "Browse our selection of delicious, pet-safe cakes.", ru: "Просмотрите наш выбор вкусных и безопасных тортов.", pl: "Przejrzyj nasz wybór pysznych i bezpiecznych tortów dla zwierząt." },

// About Page
ourStory: { hy: "Մեր պատմությունը", en: "Our Story", ru: "Наша история", pl: "Nasza historia" },
aboutDescription: {
  hy: "Մեր պատմությունը սկսվեց սիրուց և ցանկությունից՝ ուրախացնել մեր կենդանիներին յուրահատուկ և անմոռանալի ձևով. Մենք ուզում էինք նրանց նվիրել տորթ, որը կլինի համեղ, անվտանգ և լիովին իրենց համար. Այսպես ծնվեց Chupaboo — փոքրիկ նախագիծ, որը այսօր ուրախացնում է հարյուրավոր կենդանիների ու նրանց ընտանիքների կյանքը. Մեր տորթերը պատրաստվում են սիրով ու հոգատարությամբ՝ միայն առողջարար, վետերինարների կողմից հաստատված բաղադրիչներից. Քանի որ ձեր կենդանիները պարզապես կենդանիներ չեն, նրանք ընտանիքի լիիրավ անդամներ են՝ արժանի ամենալավին:",
  en: "It all started with a simple wish: to celebrate our own pets' birthdays with something truly special. When we couldn't find cakes that were both safe and delicious for our furry family members, we decided to create our own. Today, Chupaboo has grown from a home-kitchen passion project into a beloved bakery serving thousands of happy pets and their families. Every cake we make is crafted with the same love and care as that very first creation. Our dedicated team of bakers uses only vet-approved, human-grade ingredients to ensure every treat is as healthy as it is delicious. Because your pets deserve the very best.",
  ru: "Всё началось с простого желания — отметить дни рождения наших питомцев чем-то по-настоящему особенным. Когда мы не нашли торты, которые были бы одновременно безопасными и вкусными для наших пушистых членов семьи, мы решили создать их сами. Сегодня Chupaboo выросла из небольшого домашнего проекта в любимую пекарню, обслуживающую тысячи счастливых питомцев и их семьи. Каждый торт мы создаём с той же любовью и заботой, что и самый первый. Наша преданная команда пекарей использует только одобренные ветеринарами ингредиенты, пригодные для употребления человеком, чтобы каждый десерт был не только вкусным, но и полезным. Ведь ваши питомцы заслуживают самое лучшее.",
  pl: "Wszystko zaczęło się od prostego pragnienia: świętować urodziny naszych zwierząt w wyjątkowy sposób. Kiedy nie mogliśmy znaleźć tortów, które byłyby zarówno bezpieczne, jak i smaczne dla naszych futrzastych członków rodziny, postanowiliśmy stworzyć własne. Dziś Chupaboo rozrosło się z domowego projektu pasji w ukochaną cukiernię, obsługującą tysiące szczęśliwych zwierząt i ich rodziny. Każdy tort, który tworzymy, jest wykonany z taką samą miłością i troską jak pierwszy wypiek. Nasz oddany zespół cukierników używa tylko składników zatwierdzonych przez weterynarzy, aby każda przekąska była tak zdrowa, jak pyszna. Bo Twoje zwierzęta zasługują na to, co najlepsze."
},
messages: {
  hy: "Ինչ-որ սխալ է տեղի ունեցել",
  ru: "Произошла ошибка",
  en: "Something went wrong",
  pl: "Coś poszło nie tak"
},

CREATEYOURPETSCAKE: {
  hy: "ՍՏԵՂԾԻՐ ՔՈ ԿԵՆԴԱՆՈՒ ՏՈՐԹԸ",
  ru: "СОЗДАЙ ТОРТ ДЛЯ СВОЕГО ПИТОМЦА",
  en: "CREATE YOUR PET’S CAKE",
  pl: "STWÓRZ TORT DLA SWOJEGO ZWIERZAKA"
},

choosemaincake: {
  hy: "Ընտրիր տորթի հիմնական բաղադրիչը",
  ru: "Выбери основной ингредиент торта",
  en: "Choose the main cake ingredient",
  pl: "Wybierz główny składnik tortu"
},

choosecream: {
  hy: "Ընտրիր կրեմի տեսակը",
  ru: "Выбери тип крема",
  en: "Choose the type of cream",
  pl: "Wybierz rodzaj kremu"
},

chooseshape: {
  hy: "Ընտրիր տորթի ձևը",
  ru: "Выбери форму торта",
  en: "Choose the cake shape",
  pl: "Wybierz kształt tortu"
},

MEAT: {
  hy: "ՄԻՍ",
  ru: "МЯСО",
  en: "MEAT",
  pl: "MIĘSO"
},

FRUIT: {
  hy: "ՄԻՐԳ",
  ru: "ФРУКТЫ",
  en: "FRUIT",
  pl: "OWOCE"
},

VEGETABLES: {
  hy: "ԲԱՆՋԱՐԵՂԵՆ",
  ru: "ОВОЩИ",
  en: "VEGETABLES",
  pl: "WARZYWA"
},

DAIRY: {
  hy: "ԿԱԹՆԱՅԻՆ",
  ru: "МОЛОЧНЫЙ",
  en: "DAIRY",
  pl: "MLECZNY"
},

PLANTBASEDMILK: {
  hy: "ԲՈՒՍԱԿԱՆ ԿԱԹ",
  ru: "РАСТИТЕЛЬНОЕ МОЛОКО",
  en: "PLANT-BASED MILK",
  pl: "NAPÓJ ROŚLINNY"
},

PLANTBASED: {
  hy: "ԲՈՒՍԱԿԱՆ",
  ru: "РАСТИТЕЛЬНЫЙ",
  en: "PLANT-BASED",
  pl: "ROŚLINNY"
},

selected: {
  hy: "Ընտրված է",
  ru: "Выбрано",
  en: "Selected",
  pl: "Wybrane"
},


happyPets: { 
  hy: "Ուրախ պահեր", 
  en: "Happy Pets", 
  ru: "Счастливых питомцев",
  pl: "Szczęśliwe zwierzęta"
},

happyFamilies: { 
  hy: "Շնորհավոր ընտանիքներ", 
  en: "Happy Families", 
  ru: "Счастливых семей",
  pl: "Szczęśliwe rodziny"
},

ourValues: { 
  hy: "Մեր արժեքները", 
  en: "Our Values", 
  ru: "Наши ценности",
  pl: "Nasze wartości"
},

qualityFirst: { 
  hy: "Առաջնային որակը", 
  en: "Quality First", 
  ru: "Качество прежде всего",
  pl: "Jakość przede wszystkim"
},

qualityFirstDesc: { 
  hy: "Մենք երբեք չենք խնայել բաղադրիչների որակի վրա։ Յուրաքանչյուր բաղադրիչ մանրակրկիտ ընտրված է ձեր կենդանիների համար անվտանգ ու սննդարար լինելու համար։", 
  en: "We never compromise on ingredients. Every component is carefully selected and tested to ensure it's safe and nutritious for your pets.", 
  ru: "Мы никогда не идём на компромисс в качестве ингредиентов.",
  pl: "Nigdy nie oszczędzamy na jakości składników. Każdy składnik jest starannie wybrany i sprawdzony, aby był bezpieczny i pożywny dla Twoich zwierząt."
},

madeWithLove: { 
  hy: "Սիրով պատրաստված", 
  en: "Made with Love", 
  ru: "Сделано с любовью",
  pl: "Wykonane z miłością"
},

madeWithLoveDesc: { 
  hy: "Յուրաքանչյուր տորթ ձեռագործ է մեր ոգևոր թիմի կողմից։ Մենք ներդնում ենք մեր սիրտը յուրաքանչյուր ստեղծագործության մեջ։", 
  en: "Each cake is handcrafted by our passionate team. We pour our hearts into every creation because we know how much your pets mean to you.", 
  ru: "Каждый торт создан вручную нашей командой с любовью.",
  pl: "Każdy tort jest ręcznie wykonany przez nasz pełen pasji zespół. Wkładamy serce w każde dzieło, ponieważ wiemy, jak bardzo Twoje zwierzęta są dla Ciebie ważne."
},

petHappiness: { 
  hy: "Կենդանու ուրախություն", 
  en: "Pet Happiness", 
  ru: "Счастье питомцев",
  pl: "Szczęście zwierząt"
},

petHappinessDesc: { 
  hy: "Մեր աշխատանքը չափվում է մեկ բանով՝ ձեր կենդանու ուրախությամբ։ Երբ պոչերը շարժվում են, մենք գիտենք՝ մեր նպատակն իրականացված է։", 
  en: "Our ultimate goal is to see tails wagging and purrs of contentment. Your pet's joy is our greatest reward.", 
  ru: "Наша главная цель - видеть виляющие хвосты и довольное мурлыканье.",
  pl: "Naszym celem jest widzieć merdające ogony i zadowolone mruczenie. Radość Twojego zwierzaka jest naszą największą nagrodą."
},

  // Checkout
  cartEmpty: { 
    hy: "Ձեր զամբյուղը դատարկ է", 
    en: "Your cart is empty", 
    ru: "Корзина пуста",
    pl: "Twój koszyk jest pusty"
  },
  
  cartEmptyDesc: { 
    hy: "Ավելացրեք համեղ տորթեր ձեր զամբյուղին նախքան վճարումը։", 
    en: "Add some delicious cakes to your cart before checking out.", 
    ru: "Добавьте вкусные торты в корзину перед оформлением.",
    pl: "Dodaj kilka pysznych tortów do koszyka przed dokonaniem płatności."
  },
  
  browseCakes: { 
    hy: "Դիտել տորթերը", 
    en: "Browse Cakes", 
    ru: "Смотреть торты",
    pl: "Przeglądaj torty"
  },
  
  backToShop: { 
    hy: "Վերադառնալ խանութ", 
    en: "Back to Shop", 
    ru: "Вернуться в магазин",
    pl: "Powrót do sklepu"
  },
  
  orderSummary: { 
    hy: "Պատվերի ամփոփում", 
    en: "Order Summary", 
    ru: "Сводка заказа",
    pl: "Podsumowanie zamówienia"
  },
  
  total: { 
    hy: "Ընդհանուր", 
    en: "Total", 
    ru: "Итого",
    pl: "Łącznie"
  },
  
}

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("hy")

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
