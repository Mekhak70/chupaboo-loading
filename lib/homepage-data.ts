import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (url, options) =>
        fetch(url, { ...options, cache: "no-store" }),
    },
  }
);

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3C/svg%3E";

export async function getHomepageData(language: string) {
  let products: any[] = [];
  let available: any[] = [];
  let productsParty: any[] = [];
  let faqs: any[] = [];

  let catalogError = "";
  let faqError = "";

  await Promise.all([
    (async () => {
      try {
        const rows: any[] = [];

        for (let offset = 0; ; offset += 500) {
          const { data, error } = await supabase
            .from("catalog_products")
            .select("*")
            .eq("is_active", true)
            .eq("is_featured", true)
            .in("section", ["cake", "available", "party"])
            .order("sort_order")
            .order("created_at")
            .order("id")
            .range(offset, offset + 499);

          if (error) throw error;

          rows.push(...(data ?? []));

          if (!data || data.length < 500) break;
        }

        const formatted = rows.map((item) => {
          const path = String(item.image_path ?? "");

          const image = /^https?:\/\//i.test(path)
            ? path
            : path
              ? supabase.storage
                  .from("catalog-images")
                  .getPublicUrl(path).data.publicUrl
              : PLACEHOLDER_IMAGE;

          const size = String(
            item.cake_size ?? ""
          ).toLowerCase();

          return {
            ...item,
            id: String(item.id),
            name: item.name,
            price: Number(item.price ?? 0),
            stock: Number(item.stock_quantity ?? 0),
            category:
              size === "mini"
                ? "small"
                : size === "standard"
                  ? "standart"
                  : size,
            cream: Boolean(item.has_cream),
            image: item.section === "party" ? [image] : image,
          };
        });

        products = formatted.filter(
          (item) => item.section === "cake"
        );

        available = formatted.filter(
          (item) =>
            item.section === "available" && item.stock > 0
        );

        productsParty = formatted.filter(
          (item) =>
            item.section === "party" && item.stock > 0
        );
      } catch (error) {
        console.error("Homepage catalog error:", error);
        catalogError = "Ապրանքները չհաջողվեց բեռնել։";
      }
    })(),

    (async () => {
      try {
        const rows: any[] = [];

        for (let offset = 0; ; offset += 500) {
          const { data, error } = await supabase
            .from("homepage_content")
            .select("id,title,answer,icon")
            .eq("kind", "faq")
            .eq("language", language)
            .eq("is_active", true)
            .order("sort_order")
            .order("id")
            .range(offset, offset + 499);

          if (error) throw error;

          rows.push(...(data ?? []));

          if (!data || data.length < 500) break;
        }

        faqs = rows;
      } catch (error) {
        console.error("Homepage FAQ error:", error);
        faqError = "Հարցերը չհաջողվեց բեռնել։";
      }
    })(),
  ]);

  return {
    products,
    available,
    productsParty,
    faqs,
    catalogError,
    faqError,
  };
}

export type HomepageData = Awaited<
  ReturnType<typeof getHomepageData>
>;