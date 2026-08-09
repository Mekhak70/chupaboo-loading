"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  original_price?: number;
  image?: string | null;
  ingredient?: string | null;
  options?: Record<string, any> | null;
};

type Order = {
  id: string;
  created_at: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  payment_method: string | null;
  items: OrderItem[] | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes: string | null;
  status: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // GET ORDERS FROM SUPABASE
  // ==========================================

  const fetchOrders = async () => {
    try {
      setError(null);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Fetch orders error:", error);
        setError(error.message);
        return;
      }

      console.log("Orders from Supabase:", data);

      setOrders(data || []);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Պատվերները ստանալու ժամանակ սխալ տեղի ունեցավ");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL FETCH + REALTIME
  // ==========================================

  useEffect(() => {
    // Առաջին անգամ ստանում ենք պատվերները
    fetchOrders();

    // Ստեղծում ենք realtime channel
    const channel = supabase
      .channel("orders-admin")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Realtime order change:", payload);

          // Ամեն փոփոխությունից հետո նորից ստանում ենք բոլոր պատվերները
          fetchOrders();
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-semibold">
          Պատվերները բեռնվում են...
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Սխալ
          </h2>

          <p className="text-red-500">
            {error}
          </p>

          <button
            onClick={fetchOrders}
            className="mt-4 rounded-xl bg-red-500 px-5 py-2 text-white hover:bg-red-600"
          >
            Կրկին փորձել
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Պատվերներ
            </h1>

            <p className="mt-1 text-gray-500">
              Ընդհանուր պատվերներ՝ {orders.length}
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Թարմացնել
          </button>
        </div>

        {/* EMPTY */}
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">
              📦
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              Պատվերներ չկան
            </h2>

            <p className="mt-2 text-gray-500">
              Նոր պատվերները այստեղ ավտոմատ կհայտնվեն։
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >

                {/* ORDER HEADER */}
                <div className="border-b border-gray-100 p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">
                          #{order.id}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            order.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : order.status === "confirmed"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "preparing"
                              ? "bg-purple-100 text-purple-700"
                              : order.status === "out_for_delivery"
                              ? "bg-orange-100 text-orange-700"
                              : order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-400">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString(
                              "hy-AM"
                            )
                          : ""}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-sm text-gray-500">
                        Ընդհանուր
                      </p>

                      <p className="text-2xl font-bold text-gray-900">
                        {Number(order.total).toLocaleString("hy-AM")} ֏
                      </p>
                    </div>

                  </div>
                </div>

                {/* ORDER BODY */}
                <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-3">

                  {/* CUSTOMER */}
                  <div>
                    <h3 className="mb-3 font-bold text-gray-900">
                      Հաճախորդ
                    </h3>

                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-400">
                          Անուն՝{" "}
                        </span>

                        <span className="font-medium">
                          {order.name || "—"}
                        </span>
                      </p>

                      <p>
                        <span className="text-gray-400">
                          Հեռախոս՝{" "}
                        </span>

                        <a
                          href={`tel:${order.phone}`}
                          className="font-medium text-blue-600"
                        >
                          {order.phone || "—"}
                        </a>
                      </p>

                      <p>
                        <span className="text-gray-400">
                          Հասցե՝{" "}
                        </span>

                        <span className="font-medium">
                          {order.address || "—"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* DELIVERY */}
                  <div>
                    <h3 className="mb-3 font-bold text-gray-900">
                      Առաքում
                    </h3>

                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-400">
                          Ամսաթիվ՝{" "}
                        </span>

                        <span className="font-medium">
                          {order.delivery_date || "—"}
                        </span>
                      </p>

                      <p>
                        <span className="text-gray-400">
                          Ժամ՝{" "}
                        </span>

                        <span className="font-medium">
                          {order.delivery_time || "—"}
                        </span>
                      </p>

                      <p>
                        <span className="text-gray-400">
                          Վճարում՝{" "}
                        </span>

                        <span className="font-medium">
                          {order.payment_method || "—"}
                        </span>
                      </p>

                      <p>
                        <span className="text-gray-400">
                          Առաքում՝{" "}
                        </span>

                        <span className="font-medium">
                          {Number(order.delivery_fee).toLocaleString(
                            "hy-AM"
                          )}{" "}
                          ֏
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* TOTAL */}
                  <div>
                    <h3 className="mb-3 font-bold text-gray-900">
                      Գումար
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Ապրանքներ
                        </span>

                        <span>
                          {Number(order.subtotal).toLocaleString(
                            "hy-AM"
                          )}{" "}
                          ֏
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Առաքում
                        </span>

                        <span>
                          {Number(order.delivery_fee).toLocaleString(
                            "hy-AM"
                          )}{" "}
                          ֏
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between border-t pt-3 text-lg font-bold">
                        <span>
                          Ընդամենը
                        </span>

                        <span>
                          {Number(order.total).toLocaleString(
                            "hy-AM"
                          )}{" "}
                          ֏
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ITEMS */}
                <div className="border-t border-gray-100 bg-gray-50 p-5 md:p-6">
                  <h3 className="mb-4 font-bold text-gray-900">
                    Պատվերի ապրանքներ
                  </h3>

                  <div className="space-y-3">
                    {Array.isArray(order.items) &&
                      order.items.map((item, index) => (
                        <div
                          key={`${order.id}-${item.id}-${index}`}
                          className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4"
                        >
                          <div className="flex min-w-0 items-center gap-4">

                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-16 w-16 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
                                📦
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900">
                                {item.name}
                              </p>

                              <p className="text-sm text-gray-500">
                                Քանակ՝ {item.quantity}
                              </p>

                              {item.ingredient && (
                                <p className="mt-1 text-xs text-gray-400">
                                  {item.ingredient}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="font-bold text-gray-900">
                              {Number(item.price).toLocaleString(
                                "hy-AM"
                              )}{" "}
                              ֏
                            </p>

                            {item.original_price &&
                              item.original_price !== item.price && (
                                <p className="text-xs text-gray-400 line-through">
                                  {Number(
                                    item.original_price
                                  ).toLocaleString("hy-AM")}{" "}
                                  ֏
                                </p>
                              )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* NOTES */}
                {order.notes && (
                  <div className="border-t border-gray-100 p-5 md:p-6">
                    <h3 className="mb-2 font-bold text-gray-900">
                      Նշում
                    </h3>

                    <p className="text-sm text-gray-600">
                      {order.notes}
                    </p>
                  </div>
                )}

              </div>
            ))}

          </div>
        )}
      </div>
    </main>
  );
}