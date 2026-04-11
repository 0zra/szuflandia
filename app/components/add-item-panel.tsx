"use client";

import { useState, useMemo } from "react";
import { SlidePanel } from "@/app/components/slide-panel";
import { useCategories, useAddItem } from "@/app/hooks/use-pantry";
import { Minus, Plus } from "@/app/components/icons";

type LocationOption = {
  label: string;
  categoryId?: string;
  subCategoryId?: string;
};

export function AddItemPanel({
  open,
  onClose,
  preselectedCategoryId,
  preselectedSubCategoryId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  preselectedCategoryId?: string;
  preselectedSubCategoryId?: string;
  onCreated?: (id: string) => void;
}) {
  const { data: categories } = useCategories();
  const addItem = useAddItem();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("");
  const [locationKey, setLocationKey] = useState("");
  const [error, setError] = useState("");

  // Build a flat list of location options: categories + their subcategories
  const locations = useMemo<LocationOption[]>(() => {
    if (!categories) return [];
    const opts: LocationOption[] = [];
    for (const cat of categories) {
      opts.push({ label: cat.name, categoryId: cat.id });
      for (const sub of cat.subCategories) {
        opts.push({
          label: `${cat.name} / ${sub.name}`,
          subCategoryId: sub.id,
        });
      }
    }
    return opts;
  }, [categories]);

  // Resolve preselected location
  const resolvedKey =
    locationKey ||
    (preselectedSubCategoryId
      ? `sub:${preselectedSubCategoryId}`
      : preselectedCategoryId
        ? `cat:${preselectedCategoryId}`
        : "");

  function reset() {
    setName("");
    setQuantity(1);
    setUnit("");
    setLocationKey("");
    setError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function adjustQuantity(delta: number) {
    setQuantity((prev) => Math.max(0, Math.round((prev + delta) * 10) / 10));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Nazwa produktu jest wymagana.");
      return;
    }
    if (!resolvedKey) {
      setError("Wybierz lokalizację.");
      return;
    }

    const isSub = resolvedKey.startsWith("sub:");
    const id = resolvedKey.replace(/^(cat|sub):/, "");

    addItem.mutate(
      {
        name: trimmedName,
        quantity,
        unit: unit.trim(),
        categoryId: isSub ? undefined : id,
        subCategoryId: isSub ? id : undefined,
      },
      {
        onSuccess: (created) => {
          reset();
          onClose();
          onCreated?.(created.id);
        },
        onError: () => setError("Nie udało się dodać produktu."),
      }
    );
  }

  return (
    <SlidePanel open={open} onClose={handleClose} title="Dodaj produkt">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="item-name"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Nazwa produktu
          </label>
          <input
            id="item-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder='np. "Mleko", "Pierś z kurczaka"'
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          />
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Ilość
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => adjustQuantity(-0.5)}
              disabled={quantity <= 0}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Minus />
            </button>
            <input
              type="number"
              step="0.1"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="h-10 w-20 rounded-lg border border-zinc-300 bg-white text-center text-sm font-medium tabular-nums outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
            />
            <button
              type="button"
              onClick={() => adjustQuantity(0.5)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Plus />
            </button>
          </div>
        </div>

        {/* Location descriptor */}
        <div className="space-y-1.5">
          <label
            htmlFor="item-unit"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Lokacija
          </label>
          <input
            id="item-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder='np. "górna półka", "szuflada"'
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label
            htmlFor="item-location"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Lokalizacja
          </label>
          <select
            id="item-location"
            value={resolvedKey}
            onChange={(e) => {
              setLocationKey(e.target.value);
              setError("");
            }}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          >
            <option value="">Wybierz lokalizację...</option>
            {locations.map((loc) => {
              const key = loc.subCategoryId
                ? `sub:${loc.subCategoryId}`
                : `cat:${loc.categoryId}`;
              return (
                <option key={key} value={key}>
                  {loc.label}
                </option>
              );
            })}
          </select>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={addItem.isPending}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {addItem.isPending ? "Dodawanie..." : "Dodaj produkt"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Anuluj
          </button>
        </div>
      </form>
    </SlidePanel>
  );
}
