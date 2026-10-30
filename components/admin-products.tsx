"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ArrowUpToLine, ArrowDownToLine, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Section = "cake" | "party" | "available";
type Design =
  | "STANDARD"
  | "NAME_TEXT"
  | "CUSTOM_PHOTO"
  | "CUSTOM_DESIGN";

type Product = {
  id: string;
  section: Section;
  name: string;
  price: number;
  image_path: string;
  cake_size: "MINI" | "MIDI" | "STANDARD" | null;
  has_cream: boolean;
  design_types: Design[];
  standard_text: string;
  ingredients: string;
  stock_quantity: number | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
};

const BUCKET = "catalog-images";

const sectionNames: Record<Section, string> = {
  cake: "Տորթեր",
  party: "PartyShop",
  available: "Առկա տեսականի",
};

const designOptions: { value: Design; label: string }[] = [
  { value: "STANDARD", label: "Ստանդարտ" },
  { value: "NAME_TEXT", label: "Տորթի վրա գրվածքով" },
  { value: "CUSTOM_PHOTO", label: "Շան լուսանկարով" },
  { value: "CUSTOM_DESIGN", label: "Անհատական դիզայն" },
];

const inputClass =
  "mt-2 w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#69429a] focus:ring-2 focus:ring-purple-100";

const buttonClass =
  "rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-[#69429a] hover:bg-purple-50 disabled:opacity-50";

function imageUrl(path: string) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function errorMessage(error: unknown) {
  return error && typeof error === "object" && "message" in error
    ? String(error.message)
    : "Գործողությունը չհաջողվեց։";
}

function SortableProduct({
  product,
  disabled,
  position,
  total,
  onFirst,
  onLast,
  children,
}: {
  product: Product;
  disabled: boolean;
  position: number;
  total: number;
  onFirst: () => void;
  onLast: () => void;
  children: ReactNode;
}) {
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: product.id, disabled });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: "relative",
        zIndex: isDragging ? 20 : undefined,
        opacity: isDragging ? 0.7 : 1,
      }}
      className={`overflow-hidden rounded-2xl border bg-white ${
        isDragging ? "border-[#69429a] shadow-xl" : "border-purple-100"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-purple-100 bg-purple-50/50 p-2">
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          disabled={disabled}
          aria-label={`Տեղափոխել՝ ${product.name}`}
          title="Քաշիր՝ հերթականությունը փոխելու համար"
          className="flex touch-none items-center gap-2 rounded-lg p-2 text-sm text-[#69429a] enabled:cursor-grab active:cursor-grabbing disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69429a]"
        >
          <GripVertical className="h-5 w-5" />
          Տեղափոխել
        </button>
        <div className="flex gap-1">
          <button type="button" disabled={disabled || position === 0}
            onClick={onFirst} aria-label={`${product.name}՝ առաջինը`}
            title="Տեղափոխել առաջին տեղ" className="rounded-lg p-2 text-[#69429a] hover:bg-purple-100 disabled:opacity-30">
            <ArrowUpToLine className="h-4 w-4" />
          </button>
          <button type="button" disabled={disabled || position === total - 1}
            onClick={onLast} aria-label={`${product.name}՝ վերջինը`}
            title="Տեղափոխել վերջին տեղ" className="rounded-lg p-2 text-[#69429a] hover:bg-purple-100 disabled:opacity-30">
            <ArrowDownToLine className="h-4 w-4" />
          </button>
        </div>
      </div>
      {children}
    </article>
  );
}

export function AdminProducts({
  refreshVersion = 0,
}: {
  refreshVersion?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<Section | "all">("cake");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editing, setEditing] = useState<Product | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const lock = useRef(false);
  const loadVersion = useRef(0);

  const loadProducts = useCallback(async () => {
    const version = ++loadVersion.current;
    setLoading(true);

    try {
      const collected: Product[] = [];
      const pageSize = 500;

      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await supabase
          .from("catalog_products")
          .select("*")
          .order("section")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true })
          .order("id")
          .range(offset, offset + pageSize - 1);

        if (error) throw error;
        if (version !== loadVersion.current) return;

        collected.push(...((data ?? []) as Product[]));
        if (!data || data.length < pageSize) break;
      }

      if (version === loadVersion.current) {
        setProducts(collected);
      }
    } catch (cause) {
      if (version === loadVersion.current) {
        setError(errorMessage(cause));
      }
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();

    return () => {
      loadVersion.current += 1;
    };
  }, [loadProducts, refreshVersion]);

  useEffect(() => {
    if (!newImage) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(newImage);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [newImage]);

  function startEdit(product: Product) {
    setEditing({
      ...product,
      design_types: [...product.design_types],
    });
    setNewImage(null);
    setError("");
    setMessage("");
  }

  function patch<K extends keyof Product>(key: K, value: Product[K]) {
    setEditing((previous) =>
      previous ? { ...previous, [key]: value } : previous
    );
  }

  // Գործողության կրկնակի սեղմումը կանխում ենք նաև ref-ով։
  async function run(action: () => Promise<void>) {
    if (lock.current) return;

    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await action();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function toggleFeatured(product: Product) {
    await run(async () => {
      const nextValue = !product.is_featured;
      const { data, error } = await supabase
        .from("catalog_products")
        .update({ is_featured: nextValue })
        .eq("id", product.id)
        .select("id, is_featured")
        .single();

      if (error) throw error;
      if (!data) throw new Error("Ապրանքը չի փոփոխվել։");

      setProducts((previous) => previous.map((item) =>
        item.id === product.id
          ? { ...item, is_featured: data.is_featured }
          : item
      ));
      setMessage(
        !data.is_featured
          ? "Ապրանքը հանվեց գլխավոր էջի սլայդերի ընտրությունից։"
          : product.is_active
            ? "Ապրանքն ընտրվեց գլխավոր էջի սլայդերի համար։ Կայքին կմիացնենք հաջորդ փուլում։"
            : "Ապրանքն ընտրվեց սլայդերի համար։ Ցուցադրվելու համար այն պետք է նաև հրապարակված լինի։"
      );
    });
  }

  async function toggleVisibility(product: Product) {
    await run(async () => {
      const { data, error } = await supabase
        .from("catalog_products")
        .update({ is_active: !product.is_active })
        .eq("id", product.id)
        .select("id")
        .single();

      if (error) throw error;
      if (!data) throw new Error("Ապրանքը չի փոփոխվել։");

      setMessage(
        product.is_active
          ? "Ապրանքը թաքցվեց կայքից։"
          : "Ապրանքը հասանելի է կայքի ցուցակի համար։"
      );

      await loadProducts();
    });
  }

  async function deleteProduct(product: Product) {
    if (
      !window.confirm(
        `Ջնջե՞լ «${product.name}» ապրանքը։ Այս գործողությունը հետ բերել հնարավոր չէ։`
      )
    ) {
      return;
    }

    await run(async () => {
      const { data, error } = await supabase
        .from("catalog_products")
        .delete()
        .eq("id", product.id)
        .select("id")
        .single();

      if (error) throw error;
      if (!data) throw new Error("Ապրանքը չի ջնջվել։");

      // Նկարը պահում ենք․ նախկին պատվերները կարող են դրա հղումն ունենալ։
      setMessage("Ապրանքը ջնջվեց կատալոգից։");
      await loadProducts();
    });
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const product = editing;
    const file = newImage;

    await run(async () => {
      if (!product.name.trim()) {
        throw new Error("Լրացրու ապրանքի անունը։");
      }

      if (!Number.isFinite(product.price) || product.price < 0) {
        throw new Error("Մուտքագրիր ճիշտ գին։");
      }

      if (
        product.section !== "cake" &&
        (product.stock_quantity === null ||
          !Number.isSafeInteger(product.stock_quantity) ||
          product.stock_quantity < 0 ||
          product.stock_quantity > 2147483647)
      ) {
        throw new Error("Մուտքագրիր ճիշտ առկա քանակ։");
      }

      if (
        product.section !== "party" &&
        product.design_types.length === 0
      ) {
        throw new Error("Ընտրիր առնվազն մեկ դիզայն։");
      }

      if (
        product.section === "available" &&
        !product.ingredients.trim()
      ) {
        throw new Error("Լրացրու բաղադրությունը։");
      }

      let uploadedPath: string | null = null;
      let saved = false;

      try {
        let path = product.image_path;

        if (file) {
          const extensions: Record<string, string> = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
          };

          const extension = extensions[file.type];

          if (!extension || file.size === 0 || file.size > 5 * 1024 * 1024) {
            throw new Error(
              "Նկարը պետք է լինի JPG/PNG/WebP և մինչև 5 MB։"
            );
          }

          path = `catalog/${crypto.randomUUID()}.${extension}`;

          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, {
              upsert: false,
              contentType: file.type,
            });

          if (error) throw error;
          uploadedPath = path;
        }

        const { data, error } = await supabase
          .from("catalog_products")
          .update({
            name: product.name.trim(),
            price: product.price,
            image_path: path,
            cake_size:
              product.section === "cake" ? product.cake_size : null,
            has_cream:
              product.section === "party" ? false : product.has_cream,
            design_types:
              product.section === "party" ? [] : product.design_types,
            standard_text:
              product.section !== "party" &&
              product.design_types.includes("STANDARD")
                ? product.standard_text.trim()
                : "",
            ingredients:
              product.section === "available"
                ? product.ingredients.trim()
                : "",
            stock_quantity:
              product.section === "cake"
                ? null
                : product.stock_quantity,
            is_active: product.is_active,
          })
          .eq("id", product.id)
          .select("id")
          .single();

        if (error) throw error;
        if (!data) throw new Error("Ապրանքը չի փոփոխվել։");

        saved = true;
        setEditing(null);
        setNewImage(null);
        setMessage("Փոփոխությունները պահպանվեցին։");
        await loadProducts();
      } finally {
        if (uploadedPath && !saved) {
          try {
            const { error } = await supabase.storage
              .from(BUCKET)
              .remove([uploadedPath]);

            if (error) console.error("Image cleanup:", error);
          } catch (cause) {
            console.error("Image cleanup:", cause);
          }
        }
      }
    });
  }

  const canSort = !busy && !loading && filter !== "all" && !search.trim();

  async function moveProduct(id: string, destination: string | "first" | "last") {
    if (!canSort || (filter as string) === "all" || lock.current) return;
    const currentSection = filter;
    const sectionProducts = products.filter((item) => item.section === currentSection);
    const from = sectionProducts.findIndex((item) => item.id === id);
    const to = destination === "first" ? 0
      : destination === "last" ? sectionProducts.length - 1
      : sectionProducts.findIndex((item) => item.id === destination);
    if (from < 0 || to < 0 || from === to) return;

    const reordered = arrayMove(sectionProducts, from, to);
    const previous = products;
    const ranks = new Map(reordered.map((item, index) => [item.id, index]));

    await run(async () => {
      // Չենք թողնում նախորդ ընթերցման պատասխանը վերագրի նոր դասավորումը։
      loadVersion.current += 1;
      setProducts((items) => items.map((item) =>
        item.section === currentSection
          ? { ...item, sort_order: ranks.get(item.id)! }
          : item
      ).sort((a, b) => a.section.localeCompare(b.section)
        || a.sort_order - b.sort_order || a.id.localeCompare(b.id)));

      try {
        const { error } = await supabase.rpc("reorder_catalog_products", {
          p_section: currentSection,
          p_ids: reordered.map((item) => item.id),
        });
        if (error) throw error;
        setMessage("Հերթականությունը պահպանվեց։");
      } catch (cause) {
        setProducts(previous);
        // Եթե մեկ այլ պատուհանից ապրանք է ավելացվել՝ ստանում ենք նոր ցանկը։
        await loadProducts();
        throw cause;
      }
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false);
    if (!event.over || event.active.id === event.over.id) return;
    void moveProduct(String(event.active.id), String(event.over.id));
  }

  const visibleProducts = products.filter(
    (product) =>
      (filter === "all" || product.section === filter) &&
      product.name.toLocaleLowerCase().includes(
        search.trim().toLocaleLowerCase()
      )
  );

  return (
    <section className="mt-10 rounded-3xl border border-purple-100 bg-white p-5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">
          Ապրանքների կառավարում
        </h2>

        <button
          type="button"
          disabled={busy || loading || dragging}
          onClick={() => {
            setError("");
            void loadProducts();
          }}
          className={buttonClass}
        >
          Թարմացնել
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
          {message}
        </p>
      )}

      {editing ? (
        <form onSubmit={saveEdit} className="mt-6">
          <fieldset disabled={busy || dragging} className="space-y-5 disabled:opacity-60">
            <h3 className="font-bold text-[#69429a]">
              Խմբագրել · {sectionNames[editing.section]}
            </h3>

            <img
              src={preview || imageUrl(editing.image_path)}
              alt={editing.name}
              className="h-40 w-40 rounded-2xl object-cover"
            />

            <label className="block text-sm text-gray-700">
              Փոխել նկարը · ոչ պարտադիր
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  setNewImage(event.target.files?.[0] ?? null);
                }}
                className="mt-2 block w-full text-sm"
              />
            </label>

            <label className="block text-sm text-gray-700">
              Անուն
              <input
                required
                maxLength={200}
                value={editing.name}
                onChange={(event) => patch("name", event.target.value)}
                className={inputClass}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-gray-700">
                Արժեք · ֏
                <input
                  required
                  type="number"
                  min="0"
                  max="9999999999.99"
                  step="0.01"
                  value={Number.isFinite(editing.price) ? editing.price : ""}
                  onChange={(event) =>
                    patch("price", event.target.valueAsNumber)
                  }
                  className={inputClass}
                />
              </label>

              {editing.section === "cake" ? (
                <label className="block text-sm text-gray-700">
                  Տորթի տեսակը
                  <select
                    value={editing.cake_size ?? "MINI"}
                    onChange={(event) =>
                      patch(
                        "cake_size",
                        event.target.value as Product["cake_size"]
                      )
                    }
                    className={inputClass}
                  >
                    <option value="MINI">Մինի</option>
                    <option value="MIDI">Միդի</option>
                    <option value="STANDARD">Ստանդարտ</option>
                  </select>
                </label>
              ) : (
                <label className="block text-sm text-gray-700">
                  Առկա քանակ
                  <input
                    required
                    type="number"
                    min="0"
                    max="2147483647"
                    step="1"
                    value={editing.stock_quantity ?? ""}
                    onChange={(event) =>
                      patch(
                        "stock_quantity",
                        event.target.value === ""
                          ? null
                          : event.target.valueAsNumber
                      )
                    }
                    className={inputClass}
                  />
                </label>
              )}
            </div>

            {editing.section === "available" && (
              <label className="block text-sm text-gray-700">
                Բաղադրություն
                <textarea
                  required
                  rows={3}
                  value={editing.ingredients}
                  onChange={(event) =>
                    patch("ingredients", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
            )}

            {editing.section !== "party" && (
              <>
                <label className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={editing.has_cream}
                    onChange={(event) =>
                      patch("has_cream", event.target.checked)
                    }
                    className="accent-[#69429a]"
                  />
                  Կրեմ ունի
                </label>

                <fieldset className="rounded-xl border border-purple-100 p-4">
                  <legend className="px-2 text-sm font-semibold text-[#69429a]">
                    Դիզայնի տեսակներ
                  </legend>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {designOptions
                      .filter(
                        (option) =>
                          editing.section === "cake" ||
                          option.value !== "CUSTOM_DESIGN"
                      )
                      .map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={editing.design_types.includes(
                              option.value
                            )}
                            onChange={() =>
                              patch(
                                "design_types",
                                editing.design_types.includes(option.value)
                                  ? editing.design_types.filter(
                                      (value) => value !== option.value
                                    )
                                  : [...editing.design_types, option.value]
                              )
                            }
                            className="accent-[#69429a]"
                          />
                          {option.label}
                        </label>
                      ))}
                  </div>
                </fieldset>

                {editing.design_types.includes("STANDARD") && (
                  <label className="block text-sm text-gray-700">
                    Ստանդարտ տեքստ
                    <input
                      value={editing.standard_text}
                      onChange={(event) =>
                        patch("standard_text", event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                )}
              </>
            )}

            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={editing.is_active}
                onChange={(event) =>
                  patch("is_active", event.target.checked)
                }
                className="accent-[#69429a]"
              />
              Ցուցադրել կայքում
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-xl bg-[#69429a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7c4fb3]"
              >
                {busy ? "Պահպանվում է..." : "Պահպանել փոփոխությունները"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setNewImage(null);
                  setError("");
                }}
                className={buttonClass}
              >
                Չեղարկել
              </button>
            </div>
          </fieldset>
        </form>
      ) : (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input
              aria-label="Որոնել ապրանք"
              placeholder="Փնտրել անունով..."
              value={search}
              disabled={busy || dragging}
              onChange={(event) => setSearch(event.target.value)}
              className={inputClass}
            />

            <select
              aria-label="Ընտրել բաժին"
              value={filter}
              disabled={busy || dragging}
              onChange={(event) =>
                setFilter(event.target.value as Section | "all")
              }
              className={inputClass}
            >
              <option value="all">Բոլոր բաժինները</option>
              <option value="cake">Տորթեր</option>
              <option value="party">PartyShop</option>
              <option value="available">Առկա տեսականի</option>
            </select>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            {filter === "all"
              ? "Դասավորելու համար ընտրիր մեկ բաժին։"
              : search.trim()
                ? "Դասավորելու համար մաքրիր որոնումը։"
                : "Քաշիր քարտի «Տեղափոխել» կոճակը կամ սլաքներով դիր առաջինը / վերջինը։ Հերթականությունն ավտոմատ պահպանվում է։"}
          </p>

          {loading ? (
            <p role="status" className="py-8 text-center text-gray-500">
              Բեռնվում է...
            </p>
          ) : visibleProducts.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              Ապրանքներ չեն գտնվել։
            </p>
          ) : (
            <DndContext
              id="admin-catalog-sort"
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={() => setDragging(true)}
              onDragCancel={() => setDragging(false)}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={visibleProducts.map((product) => product.id)}
                strategy={rectSortingStrategy}
                disabled={!canSort}
              >
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product, index) => (
                <SortableProduct
                  key={product.id}
                  product={product}
                  disabled={!canSort}
                  position={index}
                  total={visibleProducts.length}
                  onFirst={() => void moveProduct(product.id, "first")}
                  onLast={() => void moveProduct(product.id, "last")}
                >
                  <img
                    src={imageUrl(product.image_path)}
                    alt={product.name}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />

                  <div className="p-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-[#69429a]">
                        {sectionNames[product.section]}
                      </span>

                      <span
                        className={`rounded-full px-2 py-1 ${
                          product.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.is_active ? "Ցուցադրվում է" : "Թաքցված է"}
                      </span>
                    </div>

                    {product.is_featured && (
                      <p className="mt-3 text-xs font-medium text-blue-600">
                        Ընտրված է գլխավոր էջի սլայդերի համար
                        {!product.is_active && " · այժմ թաքցված է"}
                      </p>
                    )}

                    <h3 className="mt-3 font-bold text-gray-900">
                      {product.name}
                    </h3>

                    <p className="mt-2 font-semibold text-[#69429a]">
                      {Number(product.price).toLocaleString("hy-AM")} ֏
                    </p>

                    {product.stock_quantity !== null && (
                      <p className="mt-1 text-sm text-gray-500">
                        Առկա՝ {product.stock_quantity} հատ
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy || dragging}
                        onClick={() => void toggleFeatured(product)}
                        aria-pressed={Boolean(product.is_featured)}
                        aria-label={product.is_featured
                          ? `Հանել սլայդերի ընտրությունից՝ ${product.name}`
                          : `Ընտրել սլայդերի համար՝ ${product.name}`}
                        title={product.is_featured
                          ? "Հանել գլխավոր էջի սլայդերի ընտրությունից"
                          : "Ընտրել գլխավոր էջի սլայդերի համար"}
                        className={`inline-flex items-center justify-center rounded-xl border p-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 ${
                          product.is_featured
                            ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                            : "border-gray-200 bg-white text-gray-400 hover:border-blue-200 hover:text-blue-600"
                        }`}
                      >
                        <Heart className="h-5 w-5" fill={product.is_featured ? "currentColor" : "none"} />
                      </button>
                      <button
                        type="button"
                        disabled={busy || dragging}
                        onClick={() => startEdit(product)}
                        className={buttonClass}
                      >
                        Խմբագրել
                      </button>

                      <button
                        type="button"
                        disabled={busy || dragging}
                        onClick={() => void toggleVisibility(product)}
                        className={buttonClass}
                      >
                        {product.is_active ? "Թաքցնել" : "Ցուցադրել"}
                      </button>

                      <button
                        type="button"
                        disabled={busy || dragging}
                        onClick={() => void deleteProduct(product)}
                        className="rounded-xl border border-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Ջնջել
                      </button>
                    </div>
                  </div>
                </SortableProduct>
              ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </>
      )}
    </section>
  );
}