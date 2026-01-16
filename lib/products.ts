export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  image: any
  category: "vegetable" | "fruit" |'meat' |"all"
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

export const PRODUCTS: Product[] = [
  {
    id: "peanut-butter-pup",
    name: "Peanut Butter Pup Cake",
    description: "A delicious peanut butter cake with yogurt frosting. Perfect for dogs who love peanut butter!",
    priceInCents: 2499,
    image: img1,
    category: "meat",
  },
  {
    id: "birthday-bone",
    name: "Birthday Bone Cake",
    description: "Bone-shaped cake made with wholesome ingredients. Ideal for celebrating your dog's special day.",
    priceInCents: 2999,
    image: img2,
    category: "vegetable",
  },
  {
    id: "salmon-dream",
    name: "Salmon Dream Cake",
    description:
      "Savory salmon-flavored cake that cats absolutely love. Made with real salmon and cat-safe ingredients.",
    priceInCents: 2799,
    image: img3,
    category: "fruit",
  },
  {
    id: "chicken-delight",
    name: "Chicken Delight Cake",
    description: "Tender chicken cake with a creamy topping. A favorite for both dogs and cats!",
    priceInCents: 2699,
    image: img4,
    category: "all",
  },
  {
    id: "carrot-crunch",
    name: "Carrot Crunch Cake",
    description: "Healthy carrot cake with apple and honey. A nutritious treat for your furry friend.",
    priceInCents: 2299,
    image: img5,
    category: "vegetable",
  },
  {
    id: "tuna-treat",
    name: "Tuna Treat Cake",
    description: "Irresistible tuna-flavored mini cake perfect for cats. Made with premium tuna.",
    priceInCents: 2599,
    image: img6,
    category: "meat",
  },
  {
    id: "peanut-butter-pup",
    name: "Peanut Butter Pup Cake",
    description: "A delicious peanut butter cake with yogurt frosting. Perfect for dogs who love peanut butter!",
    priceInCents: 2499,
    image: img7,
    category: "meat",
  },
  {
    id: "birthday-bone",
    name: "Birthday Bone Cake",
    description: "Bone-shaped cake made with wholesome ingredients. Ideal for celebrating your dog's special day.",
    priceInCents: 2999,
    image: img8,
    category: "vegetable",
  },
  {
    id: "salmon-dream",
    name: "Salmon Dream Cake",
    description:
      "Savory salmon-flavored cake that cats absolutely love. Made with real salmon and cat-safe ingredients.",
    priceInCents: 2799,
    image: img9,
    category: "fruit",
  },
  {
    id: "chicken-delight",
    name: "Chicken Delight Cake",
    description: "Tender chicken cake with a creamy topping. A favorite for both dogs and cats!",
    priceInCents: 2699,
    image: img10,
    category: "all",
  },
  {
    id: "carrot-crunch",
    name: "Carrot Crunch Cake",
    description: "Healthy carrot cake with apple and honey. A nutritious treat for your furry friend.",
    priceInCents: 2299,
    image: img11,
    category: "vegetable",
  },
  {
    id: "tuna-treat",
    name: "Tuna Treat Cake",
    description: "Irresistible tuna-flavored mini cake perfect for cats. Made with premium tuna.",
    priceInCents: 2599,
    image: img12,
    category: "meat",
  },
  {
    id: "carrot-crunch",
    name: "Carrot Crunch Cake",
    description: "Healthy carrot cake with apple and honey. A nutritious treat for your furry friend.",
    priceInCents: 2299,
    image: img13,
    category: "vegetable",
  },
  {
    id: "tuna-treat",
    name: "Tuna Treat Cake",
    description: "Irresistible tuna-flavored mini cake perfect for cats. Made with premium tuna.",
    priceInCents: 2599,
    image: img14,
    category: "meat",
  },
  {
    id: "tuna-treat",
    name: "Tuna Treat Cake",
    description: "Irresistible tuna-flavored mini cake perfect for cats. Made with premium tuna.",
    priceInCents: 2599,
    image: img15,
    category: "meat",
  },
]

export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`
}
