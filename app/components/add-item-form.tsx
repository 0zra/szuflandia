"use client";

import { useState } from "react";
import { Plus } from "@/app/components/icons";
import { useAddItem } from "@/app/hooks/use-pantry";

export function AddItemForm({
  categoryId,
  subCategoryId,
  onCreated,
}: {
  categoryId?: string;
  subCategoryId?: string;
  onCreated?: (id: string) => void;
}) {
  const addItem = useAddItem();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");

  function submit() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    addItem.mutate(
      {
        name: trimmedName,
        quantity: parseFloat(quantity) || 1,
        unit: unit.trim(),
        categoryId: subCategoryId ? undefined : categoryId,
        subCategoryId,
      },
      { onSuccess: (created) => onCreated?.(created.id) }
    );
    setName("");
    setQuantity("1");
    setUnit("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
      >
        <Plus width={14} height={14} />
        Dodaj produkt
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-2 px-3 py-1.5"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nazwa produktu"
        autoFocus
        className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:border-zinc-400"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setName("");
            setOpen(false);
          }
        }}
      />
      <div className="flex items-center gap-2">
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          type="number"
          step="0.1"
          min="0"
          className="w-16 rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:border-zinc-400"
        />
        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Lokacija"
          className="w-24 rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:border-zinc-400"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Dodaj
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-2 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          Anuluj
        </button>
      </div>
    </form>
  );
}
