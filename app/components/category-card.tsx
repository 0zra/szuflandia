"use client";

import { useState } from "react";
import { type CategoryWithChildren } from "@/app/actions/categories";
import {
  useEditCategory,
  useDeleteCategory,
  useAddSubCategory,
} from "@/app/hooks/use-pantry";
import { ChevronRight, Pencil, Trash, Check, X } from "@/app/components/icons";
import { ItemRow } from "@/app/components/item-row";
import { AddItemForm } from "@/app/components/add-item-form";
import { AddInline } from "@/app/components/add-inline";
import { SubCategorySection } from "@/app/components/sub-category-section";

export function CategoryCard({ category, search = "" }: { category: CategoryWithChildren; search?: string }) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const editCat = useEditCategory();
  const deleteCat = useDeleteCategory();
  const addSub = useAddSubCategory();

  const q = search.toLowerCase();
  const filteredItems = q
    ? category.items.filter((i) => i.name.toLowerCase().includes(q))
    : category.items;
  const filteredSubs = q
    ? category.subCategories.filter((s) =>
        s.items.some((i) => i.name.toLowerCase().includes(q))
      )
    : category.subCategories;

  const totalItems =
    category.items.length +
    category.subCategories.reduce((n, s) => n + s.items.length, 0);

  function saveEdit() {
    const trimmed = editName.trim();
    if (!trimmed) return;
    editCat.mutate({ id: category.id, name: trimmed });
    setEditing(false);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="group flex items-center gap-2 px-4 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronRight
            width={18}
            height={18}
            className={`text-zinc-400 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>

        {editing ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-sm font-semibold outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:border-zinc-400"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") {
                  setEditName(category.name);
                  setEditing(false);
                }
              }}
            />
            <button
              onClick={saveEdit}
              className="rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
            >
              <Check />
            </button>
            <button
              onClick={() => {
                setEditName(category.name);
                setEditing(false);
              }}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
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
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {category.name}
              </span>
              <span className="ml-2 text-xs font-normal text-zinc-400">
                {totalItems} {totalItems === 1 ? "produkt" : totalItems >= 2 && totalItems <= 4 ? "produkty" : "produktów"}
              </span>
            </button>
            <button
              onClick={() => setEditing(true)}
              className="rounded p-1 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <Pencil />
            </button>
            <button
              onClick={() => deleteCat.mutate(category.id)}
              className="rounded p-1 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
            >
              <Trash />
            </button>
          </>
        )}
      </div>

      {/* Body */}
      {expanded && (
        <div className="border-t border-zinc-100 px-1 py-2 dark:border-zinc-800">
          {/* Direct items */}
          {filteredItems.length > 0 && (
            <div className="space-y-0.5">
              {filteredItems.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </div>
          )}

          {!q && <AddItemForm categoryId={category.id} />}

          {/* Subcategories */}
          {filteredSubs.length > 0 && (
            <div className="mt-2 space-y-1">
              {filteredSubs.map((sub) => (
                <SubCategorySection key={sub.id} sub={sub} search={search} />
              ))}
            </div>
          )}

          {!q && (
            <div className="mt-1">
              <AddInline
                placeholder="Dodaj podkategorię"
                onAdd={(name) =>
                  addSub.mutate({ categoryId: category.id, name })
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
