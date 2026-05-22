export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  image: any
  cream?: boolean
  category: "small" | "standart"
}

export interface PartyShop {
  id: string
  name: string
  description: string
  priceInCents: number
  image: any
}

import img1 from '@/public/cake-1.png'

import img2 from '@/public/cake-2.png'
import img3 from '@/public/cake-3.png'
import img4 from '@/public/cake-4.png'
import img5 from '@/public/cake-5.png'
import img6 from '@/public/cake-6.png'
import img7 from '@/public/cake-7.png'
import img8 from '@/public/cake-8.png'
import img9 from '@/public/cake-9.png'
import img10 from '@/public/cake-10.png'
import img11 from '@/public/cake-11.png'
import img12 from '@/public/cake-12.png'
import img13 from '@/public/cake-13.png'
import img14 from '@/public/cake-14.png'
import img15 from '@/public/cake-15.png'
import img16 from '@/public/cake-16.png'
import img17 from '@/public/cake-17.png'
import img18 from '@/public/cake-18.png'
import img19 from '@/public/cake-19.png'
import img20 from '@/public/cake-20.png'
import img21 from '@/public/cake-21.png'
import img22 from '@/public/cake-22.png'
import img23 from '@/public/cake-23.png'
import img24 from '@/public/cake-24.png'
import img25 from '@/public/cake-25.png'
import img26 from '@/public/cake-26.png'
import img27 from '@/public/cake-27.png'
import img28 from '@/public/cake-28.png'
import img29 from '@/public/cake-29.png'
import img30 from '@/public/cake-30.png'

import partyShop1 from '@/public/party1.jpeg'
import partyShop2 from '@/public/party2.jpeg'
import partyShop3 from '@/public/party3.jpeg'
import partyShop4 from '@/public/party4.jpg'
import partyShop5 from '@/public/party5.jpg'
import partyShop6 from '@/public/party6.jpg'
import partyShop7 from '@/public/party7.jpg'
import partyShop8 from '@/public/party8.jpg'
import partyShop9 from '@/public/party9.jpg'
import partyShop10 from '@/public/party10.jpg'
import partyShop11 from '@/public/party11.jpg'
import partyShop12 from '@/public/party12.jpg'
import partyShop13 from '@/public/party13.jpg'
import partyShop14 from '@/public/party14.jpg'
import partyShop15 from '@/public/party15.jpg'
import partyShop16 from '@/public/party16.jpg'
import partyShop17 from '@/public/party17.jpeg'
import partyShop18 from '@/public/party18.jpeg'
import partyShop19 from '@/public/party19.jpeg'
import partyShop20 from '@/public/party20.jpeg'
import partyShop21 from '@/public/party21.jpeg'
import partyShop22 from '@/public/party22.jpeg'
import partyShop23 from '@/public/party23.jpeg'
import partyShop24 from '@/public/party24.jpeg'
import partyShop25 from '@/public/party25.jpg'


export const PRODUCTS: Product[] = [
  {
    id: "chupaboooo",
    name: "Chupaboooo",
    description: "Savory chupaboooo cake that cats absolutely love. Made with real salmon and cat-safe ingredients.",
    priceInCents: 12000,
    image: img3,
    category: "standart",
    cream: true,
  },
  {
    id: "chupaboooo-3",
    name: "Chupaboooo",
    description: "Savory chupaboooo cake that cats absolutely love. Made with real salmon and cat-safe ingredients.",
    priceInCents: 15000,
    image: img30,
    category: "standart",
    cream: true,
  },
  {
    id: "miniboo-1",
    name: "Miniboo",
    description: "A delicious miniboo butter cake with yogurt frosting. Perfect for dogs who love peanut butter!",
    priceInCents: 3000,
    image: img18,
    category: "small",
    cream: true,
  },
  {
    id: "pawy-1",
    name: "Pawy",
    description: "A delicious pawy butter cake with yogurt frosting. Perfect for dogs who love peanut butter!",
    priceInCents: 12000,
    image: img27,
    category: "standart",
    cream: true,
  },
  {
    id: "midi",
    name: "Midi",
    description: "A delicious pawy butter cake with yogurt frosting. Perfect for dogs who love peanut butter!",
    priceInCents: 12000,
    image: img28,
    category: "small",
    cream: true,
  },
  {
    id: "pawy",
    name: "Pawy",
    description: "A delicious pawy butter cake with yogurt frosting. Perfect for dogs who love peanut butter!",
    priceInCents: 12000,
    image: img25,
    category: "standart",
    cream: true,
  },
  {
    id: "cookieboo",
    name: "Cookieboo",
    description: "Tender cookieboo cake with a creamy topping. A favorite for both dogs and cats!",
    priceInCents: 15000,
    image: img24,
    category: "standart",
    cream: true,
  },
  {
    id: "kittboo",
    name: "Kittboo",
    description: "A delicious kittboo butter cake with yogurt frosting. Perfect for dogs who love peanut butter!",
    priceInCents: 2499,
    image: img21,
    category: "standart",
    cream: true,
  },

  {
    id: "boniboo",
    name: "Boniboo",
    description: "Healthy boniboo cake with apple and honey. A nutritious treat for your furry friend.",
    priceInCents: 12000,
    image: img26,
    category: "standart",
    cream: true,
  },
  {
    id: "lovy-bone",
    name: "Lovy",
    description: "Lovy cake made with wholesome ingredients. Ideal for celebrating your dog's special day.",
    priceInCents: 12000,
    image: img22,
    category: "standart",
    cream: true,
  },
  {
    id: "Lovy-Name",
    name: "Lovy",
    description: "A delicious pawy butter cake with yogurt frosting. Perfect for dogs who love peanut butter!",
    priceInCents: 12000,
    image: img29,
    category: "standart",
    cream: true,
  },
  {
    id: "chupaboooo-special",
    name: "Chupaboooo Special",
    description: "Savory salmon-flavored cake that cats absolutely love. Made with real salmon and cat-safe ingredients.",
    priceInCents: 12000,
    image: img23,
    category: "standart",
    cream: true,
  },
  {
    id: "miniboo-lovy-1",
    name: "Miniboo Lovy",
    description: "A delicious peanut butter cake with yogurt frosting. Perfect for dogs who love peanut butter!",
    priceInCents: 3000,
    image: img17,
    category: "small",
    cream: true,
  },
  {
    id: "chupaboooo-special-1",
    name: "Chupaboooo Special",
    description: "Bone-shaped cake made with wholesome ingredients. Ideal for celebrating your dog's special day.",
    priceInCents: 12000,
    image: img2,
    category: "standart",
    cream: true,
  },
  {
    id: "miniboo-mix",
    name: "Miniboo Mix",
    description: "A delicious peanut butter cake with yogurt frosting. Perfect for dogs who love peanut butter!",
    priceInCents: 3000,
    image: img20,
    category: "small",
    cream: true,
  },
  {
    id: "lovy-mix",
    name: "Lovy Mix",
    description: "Tender chicken cake with a creamy topping. A favorite for both dogs and cats!",
    priceInCents: 12000,
    image: img4,
    category: "standart",
    cream: true,
  },
  {
    id: "tuna-treat-1",
    name: "Tuna Treat Cake",
    description: "Irresistible tuna-flavored mini cake perfect for cats. Made with premium tuna.",
    priceInCents: 12000,
    image: img6,
    category: "standart",
    cream: true,
  },
  {
    id: "chupaboooo-1",
    name: "Chupaboooo",
    description: "A delicious peanut butter cake with yogurt frosting. Perfect for dogs who love peanut butter!",
    priceInCents: 12000,
    image: img7,
    category: "standart",
    cream: true,
  },
  {
    id: "chupaboooo-special-2",
    name: "Chupaboooo Special",
    description: "Healthy carrot cake with apple and honey. A nutritious treat for your furry friend.",
    priceInCents: 12000,
    image: img5,
    category: "standart",
    cream: true,
  },
  {
    id: "lovy-bone-1",
    name: "Lovy",
    description: "Lovy cake made with wholesome ingredients. Ideal for celebrating your dog's special day.",
    priceInCents: 12000,
    image: img8,
    category: "standart",
    cream: true,
  },
  {
    id: "salmon-dream",
    name: "Salmon Dream Cake",
    description: "Savory salmon-flavored cake that cats absolutely love. Made with real salmon and cat-safe ingredients.",
    priceInCents: 12000,
    image: img9,
    category: "standart",
    cream: true,
  },
  {
    id: "chupaboooo-2",
    name: "Chupaboooo",
    description: "Tender chicken cake with a creamy topping. A favorite for both dogs and cats!",
    priceInCents: 12000,
    image: img10,
    category: "standart",
    cream: true,
  },
  {
    id: "miniboo-2",
    name: "Miniboo",
    description: "Healthy miniboo cake with apple and honey. A nutritious treat for your furry friend.",
    priceInCents: 3000,
    image: img19,
    category: "small",
    cream: true,
  },
  {
    id: "tuna-treat-2",
    name: "Tuna Treat Cake",
    description: "Irresistible tuna-flavored mini cake perfect for cats. Made with premium tuna.",
    priceInCents: 3000,
    image: img12,
    category: "standart",
    cream: true,
  },
  {
    id: "carrot-crunch",
    name: "Carrot Crunch Cake",
    description: "Healthy carrot cake with apple and honey. A nutritious treat for your furry friend.",
    priceInCents: 12000,
    image: img13,
    category: "standart",
    cream: true,
  },
  {
    id: "lovy-soft",
    name: "Lovy Soft",
    description: "Irresistible tuna-flavored mini cake perfect for cats. Made with premium tuna.",
    priceInCents: 12000,
    image: img14,
    category: "standart",
    cream: true,
  },
  {
    id: "miniboo-lovy-2",
    name: "Miniboo Lovy",
    description: "Irresistible tuna-flavored mini cake perfect for cats. Made with premium tuna.",
    priceInCents: 3000,
    image: img16,
    category: "small",
    cream: true,
  },
]

export const PARTYSHOPDATA: PartyShop[] = [
  {
    id: 'small-hat-with-bow-tie',
    name: 'Small Hat with Bow Tie',
    description: 'Small party hat with bow tie, perfect for celebrations and themed events',
    priceInCents: 1500,
    image: partyShop1,
  },
  {
    id: 'animal-happy-birthday-banner-2',
    name: 'Animal Happy Birthday Banner',
    description: 'Colorful happy birthday banner with animal theme, perfect for pet parties and kids celebrations',
    priceInCents: 2000,
    image: partyShop20,
  },
  {
    id: 'foil-balloon',
    name: 'Foil Balloon',
    description: 'Shiny foil balloon for parties and celebrations, durable and reusable decorative balloon',
    priceInCents: 1000,
    image: partyShop8,
  },
  {
    id: 'small-hat-with-bow-tie-2',
    name: 'Small Hat with Bow Tie',
    description: 'Small party hat with bow tie, perfect for celebrations and themed events',
    priceInCents: 1500,
    image: partyShop2,
  },
  {
    id: 'animal-happy-birthday-banner',
    name: 'Animal Happy Birthday Banner',
    description: 'Colorful happy birthday banner with animal theme, perfect for pet parties and kids celebrations',
    priceInCents: 2000,
    image: partyShop5,
  },
  
  {
    id: 'Large-Bow-Tie',
    name: 'Large Bow Tie',
    description: 'Big decorative bow tie for parties and costumes, perfect for festive outfits and events',
    priceInCents: 1500,
    image: partyShop7,
  },

  {
    id: 'large-hat-with-bow-tie',
    name: 'Large Hat with Bow Tie',
    description: 'Large party hat with matching bow tie, ideal for festive celebrations and themed events',
    priceInCents: 3500,
    image: partyShop9,
  },
  {
    id: 'foil-balloon-2',
    name: 'Foil Balloon',
    description: 'Shiny foil balloon for parties and celebrations, durable and reusable decorative balloon',
    priceInCents: 1000,
    image: partyShop10,
  },
  {
    id: 'small-soft-hat',
    name: 'Small Soft Hat',
    description: 'Soft small party hat, comfortable and lightweight accessory for celebrations and costumes',
    priceInCents: 1000,
    image: partyShop11,
  },
  {
    id: 'large-soft-hat',
    name: 'Large Soft Hat',
    description: 'Large soft party hat, comfortable and lightweight accessory for festive events and costumes',
    priceInCents: 2500,
    image: partyShop12,
  },
  {
    id: 'foil-balloon-3',
    name: 'Foil Balloon',
    description: 'Shiny foil balloon for parties and celebrations, durable and reusable decorative balloon',
    priceInCents: 1000,
    image: partyShop14,
  },
  {
    id: 'large-bow-tie-2',
    name: 'Large Bow Tie',
    description: 'Big decorative bow tie for parties and costumes, perfect for festive outfits and events',
    priceInCents: 1500,
    image: partyShop15,
  },
  {
    id: 'large-balloon-dog',
    name: 'Large Balloon Dog',
    description: 'Large balloon dog decoration, perfect for parties, kids events, and festive celebrations',
    priceInCents: 1000,
    image: partyShop17,
  },
  {
    id: 'balloon-with-little-paws',
    name: 'Balloon with Little Paws',
    description: 'Cute decorative balloon with paw prints, ideal for animal-themed parties and celebrations',
    priceInCents: 300,
    image: partyShop18,
  },
  {
    id: 'large-bow-tie-3',
    name: 'Large Bow Tie',
    description: 'Big decorative bow tie for parties and costumes, perfect for festive outfits and events',
    priceInCents: 1500,
    image: partyShop19,
  },
  {
    id: 'small-bow-tie-and-hat-set',
    name: 'Small Bow Tie and Hat Set',
    description: 'Small party set including a bow tie and hat, perfect for festive celebrations and costumes',
    priceInCents: 1000,
    image: partyShop21,
  },
  {
    id: 'large-hat-with-bow-tie',
    name: 'Large Hat with Bow Tie',
    description: 'Large party hat with matching bow tie, ideal for festive celebrations and themed events',
    priceInCents: 3500,
    image: partyShop25,
  },

]
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`
}