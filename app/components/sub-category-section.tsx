"use client";

import { useState } from "react";
import { ChevronRight, Pencil, Trash, Check, X } from "@/app/components/icons";
import { ItemRow } from "@/app/components/item-row";
import { AddItemForm } from "@/app/components/add-item-form";
import {
  useEditSubCategory,
  useDeleteSubCategory,
} from "@/app/hooks/use-pantry";

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

export function SubCategorySection({ sub, search = "" }: { sub: SubCategory; search?: string }) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(sub.name);
  const editSub = useEditSubCategory();
  const deleteSub = useDeleteSubCategory();

  function saveEdit() {
    const trimmed = editName.trim();
    if (!trimmed) return;
    editSub.mutate({ id: sub.id, name: trimmed });
    setEditing(false);
  }

  return (
    <div className="ml-2 border-l border-zinc-200 pl-3 dark:border-zinc-700/50">
      <div className="group flex items-center gap-1 py-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronRight
            className={`text-zinc-400 transition-transform ${expanded ? "rotate-90" : ""}`}
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
              className="rounded p-1 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <Pencil />
            </button>
            <button
              onClick={() => deleteSub.mutate(sub.id)}
              className="rounded p-1 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
            >
              <Trash />
            </button>
          </>
        )}
      </div>

      {expanded && (
        <div className="space-y-0.5 py-1">
          {(search
            ? sub.items.filter((i) =>
                i.name.toLowerCase().includes(search.toLowerCase())
              )
            : sub.items
          ).map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
          {!search && <AddItemForm subCategoryId={sub.id} />}
        </div>
      )}
    </div>
  );
}
