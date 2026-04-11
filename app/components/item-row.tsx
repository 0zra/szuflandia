"use client";

import { useState } from "react";
import { useEditItem, useDeleteItem } from "@/app/hooks/use-pantry";
import { Minus, Plus, Pencil, Trash, Check, X } from "@/app/components/icons";
import { ConfirmModal } from "@/app/components/confirm-modal";

type Item = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  categoryId: string | null;
  subCategoryId: string | null;
};

export function ItemRow({ item }: { item: Item }) {
  const editItem = useEditItem();
  const removeItem = useDeleteItem();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editUnit, setEditUnit] = useState(item.unit);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const step = 1;

  function adjustQuantity(delta: number) {
    const next = Math.max(0, Math.round((item.quantity + delta) * 10) / 10);
    editItem.mutate({ id: item.id, quantity: next });
  }

  function saveEdit() {
    const trimmedName = editName.trim();
    if (!trimmedName) return;
    editItem.mutate({ id: item.id, name: trimmedName, unit: editUnit.trim() });
    setEditing(false);
  }

  function cancelEdit() {
    setEditName(item.name);
    setEditUnit(item.unit);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-2 py-1 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:border-zinc-400"
          placeholder="Nazwa"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") saveEdit();
            if (e.key === "Escape") cancelEdit();
          }}
        />
        <input
          value={editUnit}
          onChange={(e) => setEditUnit(e.target.value)}
          className="w-20 rounded border border-zinc-300 bg-white px-2 py-1 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:border-zinc-400"
          placeholder="Lokacija"
          onKeyDown={(e) => {
            if (e.key === "Enter") saveEdit();
            if (e.key === "Escape") cancelEdit();
          }}
        />
        <button
          onClick={saveEdit}
          className="rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
        >
          <Check />
        </button>
        <button
          onClick={cancelEdit}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          <X />
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <Trash />
        </button>

        <ConfirmModal
          open={confirmDelete}
          loading={removeItem.isPending}
          title="Usuń produkt"
          message={`Czy na pewno chcesz usunąć „${item.name}"?`}
          onConfirm={() => {
            removeItem.mutate(item.id, {
              onSettled: () => setConfirmDelete(false),
            });
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      </div>
    );
  }

  return (
    <div data-item-id={item.id} className="group flex items-center gap-1 rounded-lg px-3 py-1.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <span className="min-w-0 flex-1 truncate text-sm text-zinc-800 dark:text-zinc-200">
        {item.name}
      </span>

      <div className="flex items-center gap-0.5">
        <button
          onClick={() => adjustQuantity(-step)}
          disabled={item.quantity <= 0}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          <Minus />
        </button>

        <span className="w-12 text-center text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
          {item.quantity % 1 === 0
            ? item.quantity
            : item.quantity.toFixed(1)}
        </span>

        <button
          onClick={() => adjustQuantity(step)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
        >
          <Plus />
        </button>
      </div>

      {item.unit && (
        <span className="w-14 text-xs text-zinc-400 dark:text-zinc-500">
          {item.unit}
        </span>
      )}

      <button
        onClick={() => setEditing(true)}
        className="rounded p-1 text-zinc-400 can-hover:opacity-0 can-hover:transition-opacity can-hover:group-hover:opacity-100 hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <Pencil />
      </button>
    </div>
  );
}
