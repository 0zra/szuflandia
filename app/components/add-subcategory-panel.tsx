"use client";

import { useState } from "react";
import { SlidePanel } from "@/app/components/slide-panel";
import { useCategories, useAddSubCategory } from "@/app/hooks/use-pantry";

export function AddSubCategoryPanel({
  open,
  onClose,
  preselectedCategoryId,
}: {
  open: boolean;
  onClose: () => void;
  preselectedCategoryId?: string;
}) {
  const { data: categories } = useCategories();
  const addSub = useAddSubCategory();
  const [categoryId, setCategoryId] = useState(preselectedCategoryId ?? "");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Sync preselected when it changes
  const resolvedCategoryId = categoryId || preselectedCategoryId || "";

  function reset() {
    setName("");
    setCategoryId("");
    setError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    const catId = resolvedCategoryId;

    if (!catId) {
      setError("Please select a category.");
      return;
    }
    if (!trimmed) {
      setError("Name is required.");
      return;
    }

    addSub.mutate(
      { categoryId: catId, name: trimmed },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: () =>
          setError("Failed to create subcategory. Name may already exist in this category."),
      }
    );
  }

  return (
    <SlidePanel open={open} onClose={handleClose} title="New Subcategory">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="sub-cat"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Category
          </label>
          <select
            id="sub-cat"
            value={resolvedCategoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setError("");
            }}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          >
            <option value="">Select a category...</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="sub-name"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Subcategory name
          </label>
          <input
            id="sub-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder='e.g. "Top Shelf", "Drawer 1"'
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={addSub.isPending}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {addSub.isPending ? "Creating..." : "Create Subcategory"}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </SlidePanel>
  );
}
