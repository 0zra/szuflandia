"use client";

import { useState } from "react";
import { SlidePanel } from "@/app/components/slide-panel";
import { useAddCategory } from "@/app/hooks/use-pantry";

export function AddCategoryPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addCategory = useAddCategory();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function reset() {
    setName("");
    setError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }
    addCategory.mutate(trimmed, {
      onSuccess: () => {
        reset();
        onClose();
      },
      onError: () => setError("Failed to create category. Name may already exist."),
    });
  }

  return (
    <SlidePanel open={open} onClose={handleClose} title="New Category">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="cat-name"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Category name
          </label>
          <input
            id="cat-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder='e.g. "Fridge", "Freezer", "Pantry"'
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={addCategory.isPending}
            className="flex-1 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {addCategory.isPending ? "Creating..." : "Create Category"}
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
