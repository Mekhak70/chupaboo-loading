export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  image: any
  cream?: boolean
  category: "small" | "standart"
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
    id: "pawy",
    name: "Pawy",
    description: "A delicious pawy butter cake with yogurt frosting. Perfect for dogs who love peanut butter!",
    priceInCents: 12000,
    image: img25,
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
    id: "cookieboo",
    name: "Cookieboo",
    description: "Tender cookieboo cake with a creamy topping. A favorite for both dogs and cats!",
    priceInCents: 15000,
    image: img24,
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

export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`
}