"use client";
import { useLanguage } from "@/components/language-provider";

// Keep customer-facing donut copy together, including accessible labels and errors.
const messages = {
  intro: ["Հավաքիր քո բոքսը մի քանի սեղմումով։", "Build your box in a few clicks.", "Соберите свой бокс в несколько нажатий.", "Stwórz swój box w kilku kliknięciach."],
  yourBox: ["Քո բոքսը", "Your box", "Ваш бокс", "Twój box"],
  count: ["{n} դոնաթ", "{n} donuts", "Пончики: {n}", "Donuty: {n}"],
  pieces: ["{n} հատ", "{n} pieces", "{n} шт.", "{n} szt."],
  sizes: ["2, 4 կամ 6 հատ", "2, 4 or 6 pieces", "2, 4 или 6 шт.", "2, 4 lub 6 szt."],
  chooseQuantity: ["1. Ընտրիր քանակը", "1. Choose the quantity", "1. Выберите количество", "1. Wybierz liczbę"],
  quantityLabel: ["Դոնաթների քանակը", "Number of donuts", "Количество пончиков", "Liczba donutów"],
  chooseLooks: ["2. Ընտրիր տեսքերը", "2. Choose the designs", "2. Выберите внешний вид", "2. Wybierz wygląd"],
  slots: ["Տուփի դոնաթները", "Donuts in your box", "Пончики в боксе", "Donuty w boxie"],
  donut: ["Դոնաթ {n}", "Donut {n}", "Пончик {n}", "Donut {n}"],
  selectLook: ["Ընտրիր տեսքը", "Choose a design", "Выберите внешний вид", "Wybierz wygląd"],
  clickLook: ["Սեղմիր նկարը՝ {n}-րդ դոնաթի համար", "Tap a picture for donut {n}", "Нажмите на картинку для пончика {n}", "Wybierz zdjęcie dla donuta {n}"],
  allSelected: ["Բոլոր {n} տեսքերն ընտրված են ✓", "All {n} designs selected ✓", "Все варианты ({n}) выбраны ✓", "Wybrano wszystkie wzory ({n}) ✓"],
  sameLook: ["Բոլորը՝ առաջինի տեսքով", "Use the first design for all", "Все как первый", "Wszystkie jak pierwszy"],
  composition: ["3. Բաղադրություն", "3. Ingredients", "3. Состав", "3. Składniki"],
  change: ["Փոխել", "Change", "Изменить", "Zmień"],
  pair: ["Դոնաթներ {a}–{b}", "Donuts {a}–{b}", "Пончики {a}–{b}", "Donuty {a}–{b}"],
  pairNote: ["Զույգի երկու դոնաթները նույն բաղադրությունն ունեն։", "Both donuts in each pair share the same ingredients.", "У двух пончиков в каждой паре одинаковый состав.", "Oba donuty w każdej parze mają te same składniki."],
  pairs: ["Դոնաթների զույգերը", "Donut pairs", "Пары пончиков", "Pary donutów"],
  extraBoxes: ["Մի քանի բոքս · ոչ պարտադիր", "More boxes · optional", "Несколько боксов · необязательно", "Więcej boxów · opcjonalnie"],
  boxQuantity: ["Տուփերի քանակ", "Number of boxes", "Количество боксов", "Liczba boxów"],
  boxes: ["{n} բոքս", "Boxes: {n}", "Боксы: {n}", "Boxy: {n}"],
  remaining: ["Ընտրիր ևս {n} տեսք", "Choose {n} more designs", "Выберите ещё вариантов: {n}", "Wybierz jeszcze wzory: {n}"],
  add: ["Ավելացնել զամբյուղ", "Add to cart", "Добавить в корзину", "Dodaj do koszyka"],
  pricing: ["Գինը հաշվարկվում է դոնաթների քանակից, ընտրված տեսակներից և բաղադրություններից։", "The price depends on the number of donuts, selected varieties and ingredients.", "Цена зависит от количества пончиков, выбранных видов и состава.", "Cena zależy od liczby donutów, wybranych rodzajów i składników."],
  missingLook: ["Ընտրիր դոնաթ {n}-ի տեսակը։", "Choose a variety for donut {n}.", "Выберите вид пончика {n}.", "Wybierz rodzaj donuta {n}."],
  missingRecipe: ["Դոնաթ {n}․ լրացրու բաղադրությունը։", "Complete the ingredients for donut {n}.", "Выберите состав пончика {n}.", "Uzupełnij składniki donuta {n}."],
  preview: ["{n} դոնաթով բոքսի պատկեր", "Preview of a box with {n} donuts", "Бокс с пончиками: {n}", "Podgląd boxa z donutami: {n}"],
  edit: ["Խմբագրել դոնաթ {n}", "Edit donut {n}", "Изменить пончик {n}", "Edytuj donut {n}"],
  empty: ["Ընտրիր տեսակը", "Choose a variety", "Выберите вид", "Wybierz rodzaj"],
  hint: ["Սեղմիր դոնաթին՝ այն խմբագրելու համար", "Tap a donut to edit it", "Нажмите на пончик, чтобы изменить его", "Kliknij donut, aby go edytować"],
  guideButton: ["Ինչպե՞ս հավաքել բոքսը", "How to build your box", "Как собрать бокс", "Jak skomponować box"],
  guideTitle: ["Հավաքիր քո բոքսը՝ քայլ առ քայլ", "Build your box, step by step", "Соберите свой бокс шаг за шагом", "Stwórz swój box krok po kroku"],
  guideMeta: ["24 վայրկյան · հայերեն հուշումներով · առանց ձայնի", "24 seconds · Armenian captions · no sound", "24 секунды · подсказки на армянском · без звука", "24 sekundy · wskazówki po ormiańsku · bez dźwięku"],
  guideLabel: ["Դոնաթների բոքսը հավաքելու ուղեցույց", "Donut box ordering guide", "Инструкция по сборке бокса с пончиками", "Instrukcja komponowania boxa z donutami"],
  videoFallback: ["Քո դիտարկիչը չի ցուցադրում վիդեոն։", "Your browser cannot play this video.", "Ваш браузер не воспроизводит это видео.", "Twoja przeglądarka nie odtwarza tego filmu."],
  openGuide: ["Բացել ուղեցույցը", "Open the guide", "Открыть инструкцию", "Otwórz instrukcję"],
  guideNote: ["Ընտրիր 2, 4 կամ 6 հատ, հետո՝ տեսքերը։ Ցանկության դեպքում փոխիր զույգերի բաղադրությունը և ավելացրու զամբյուղ։ Գները ցուցադրված են որպես օրինակ․ քո բոքսի ընթացիկ արժեքը երևում է պատվերի էջում։", "Choose 2, 4 or 6 donuts, then their designs. Adjust each pair’s ingredients if you wish, then add to cart. Video prices are examples; your current total is shown on the order page.", "Выберите 2, 4 или 6 пончиков, затем их внешний вид. При желании измените состав каждой пары и добавьте в корзину. Цены в видео приведены для примера; актуальная сумма отображается на странице заказа.", "Wybierz 2, 4 lub 6 donutów, a następnie ich wygląd. Jeśli chcesz, zmień składniki każdej pary i dodaj do koszyka. Ceny w filmie są przykładowe; aktualną kwotę zobaczysz na stronie zamówienia."],
  retry: ["Կրկին փորձել", "Try again", "Попробовать снова", "Spróbuj ponownie"],
  updated: ["Տորթի տվյալները թարմացվել են։ Ստուգիր նոր գինն ու ընտրանքները և կրկին ավելացրու զամբյուղ։", "The product has been updated. Check the new price and options, then add it to your cart again.", "Данные товара обновлены. Проверьте новую цену и параметры и снова добавьте товар в корзину.", "Produkt został zaktualizowany. Sprawdź nową cenę i opcje, a następnie dodaj go ponownie do koszyka."],
  loadError: ["Ապրանքը չհաջողվեց բեռնել։", "Could not load the product.", "Не удалось загрузить товар.", "Nie udało się załadować produktu."],
  addError: ["Ապրանքը չհաջողվեց ավելացնել։", "Could not add the product.", "Не удалось добавить товар.", "Nie udało się dodać produktu."],
} as const;

export function useDonutText() {
  const { language } = useLanguage();
  const index = { hy: 0, en: 1, ru: 2, pl: 3 }[language];
  return (key: keyof typeof messages, values: Record<string, string | number> = {}) =>
    messages[key][index].replace(/\{(\w+)\}/g, (match, name: string) => String(values[name] ?? match));
}
