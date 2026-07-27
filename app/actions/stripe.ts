"use server"

import { stripe } from "@/lib/stripe"
import { PRODUCTS } from "@/lib/products"

type CartItem = {
  productId: string
  quantity: number
}

export async function startCheckoutSession(cartItems: CartItem[]) {
  // Validate all products exist and build line items
  const lineItems = cartItems.map((item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId)
    if (!product) {
      throw new Error(`Product with id "${item.productId}" not found`)
    }

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          description: product.description,
        },
        unit_amount: product.priceInCents,
      },
      quantity: item.quantity,
    }
  })

  // Create Checkout Session
// app/actions/stripe.ts
const session = await stripe.checkout.sessions.create({
  ui_mode: "embedded" as any, // կամ as "embedded"
  redirect_on_completion: "never",
  line_items: lineItems,
  mode: "payment",
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
});

  return session.client_secret
}
