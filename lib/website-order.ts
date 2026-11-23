import type { CartItem } from "@/components/cart-context";
import { checkoutUnitPrice } from "@/lib/finance";

type Delivery = { phoneNumber:string; deliveryOption:string; deliveryAddress:string; deliveryDate:string; deliveryTime:string; paymentMethod:string; deliveryFee:number };
export function websiteOrderPayload(cart:CartItem[], delivery:Delivery, discountPercent:number) {
  const hasCake=cart.some(item=>!!item.options?.cakeType);
  return {
    phone:delivery.phoneNumber.trim(),
    deliveryFee:delivery.deliveryOption==="delivery"?Math.round(delivery.deliveryFee*100)/100:0,
    delivery:{deliveryOption:delivery.deliveryOption,deliveryAddress:delivery.deliveryAddress,
      deliveryDate:delivery.deliveryDate,deliveryTime:delivery.deliveryTime,paymentMethod:delivery.paymentMethod,source:"website"},
    items:cart.map(item=>{
      const {customImage,...options}=item.options??{};
      return {id:item.id,name:item.name,quantity:item.quantity,
        price:checkoutUnitPrice(item.price,hasCake&&!item.options?.cakeType?discountPercent:0),
        image:item.image,ingredient:item.ingredient??null,
        options:{...options,...(customImage?{customImageAttached:true}:{})}};
    }),
  };
}
