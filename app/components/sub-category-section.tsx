"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Pencil, Trash, Check, X } from "@/app/components/icons";
import { ItemRow } from "@/app/components/item-row";
import { AddItemForm } from "@/app/components/add-item-form";
import {
  useEditSubCategory,
  useDeleteSubCategory,
} from "@/app/hooks/use-pantry";
import { ConfirmModal } from "@/app/components/confirm-modal";

type SubCategory = {
  id: string;
  name: string;
  categoryId: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    categoryId: string | null;
    subCategoryId: string | null;
  }[];
};

export function SubCategorySection({
  sub,
  search = "",
  scrollTarget,
  onCreated,
}: {
  sub: SubCategory;
  search?: string;
  scrollTarget?: string | null;
  onCreated?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(sub.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editSub = useEditSubCategory();
  const deleteSub = useDeleteSubCategory();

  function saveEdit() {
    const trimmed = editName.trim();
    if (!trimmed) return;
    editSub.mutate({ id: sub.id, name: trimmed });
    setEditing(false);
  }

  // Auto-expand when scrollTarget is this subcategory or one of its items
  useEffect(() => {
    if (!scrollTarget) return;
    const isMe = scrollTarget === sub.id;
    const hasItem = sub.items.some((i) => i.id === scrollTarget);
    if (isMe || hasItem) {
      setExpanded(true);
    }
  }, [scrollTarget, sub]);

  const q = search.toLowerCase();
  const subNameMatch = q ? sub.name.toLowerCase().includes(q) : false;
  const isExpanded = q ? true : expanded;

  return (
    <div data-subcategory-id={sub.id} className="ml-2 border-l border-zinc-200 pl-3 dark:border-zinc-700/50">
      <div className="group flex items-center gap-1 py-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronRight
            className={`text-zinc-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          />
        </button>

        {editing ? (
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-2 py-0.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:border-zinc-400"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") {
                  setEditName(sub.name);
                  setEditing(false);
                }
              }}
            />
            <button
              onClick={saveEdit}
              className="rounded p-0.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
            >
              <Check />
            </button>
            <button
              onClick={() => {
                setEditName(sub.name);
                setEditing(false);
              }}
              className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              <X />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="min-w-0 flex-1 text-left"
            >
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {sub.name}
              </span>
              <span className="ml-2 text-xs text-zinc-400">
                {sub.items.length}
              </span>
            </button>
            <button
              onClick={() => setEditing(true)}
              className="rounded p-1 text-zinc-400 can-hover:opacity-0 can-hover:transition-opacity can-hover:group-hover:opacity-100 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <Pencil />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded p-1 text-zinc-400 can-hover:opacity-0 can-hover:transition-opacity can-hover:group-hover:opacity-100 hover:text-red-500"
            >
              <Trash />
            </button>
          </>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-0.5 py-1">
          {(q && !subNameMatch
            ? sub.items.filter((i) =>
                i.name.toLowerCase().includes(q)
              )
            : sub.items
          ).map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
          {!q && <AddItemForm subCategoryId={sub.id} onCreated={onCreated} />}
        </div>
      )}
      <ConfirmModal
        open={confirmDelete}
        loading={deleteSub.isPending}
        title="Usuń podkategorię"
        message={`Czy na pewno chcesz usunąć podkategorię „${sub.name}"? Wszystkie produkty w tej podkategorii zostaną również usunięte.`}
        onConfirm={() => {
          deleteSub.mutate(sub.id, {
            onSettled: () => setConfirmDelete(false),
          });
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
