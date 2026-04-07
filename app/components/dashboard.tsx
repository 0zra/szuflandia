"use client";

import { useState } from "react";
import { useCategories, useAddCategory } from "@/app/hooks/use-pantry";
import { logout } from "@/app/actions/auth";
import { CategoryCard } from "@/app/components/category-card";
import { AddInline } from "@/app/components/add-inline";
import { LogOut, Plus } from "@/app/components/icons";
import { AddCategoryPanel } from "@/app/components/add-category-panel";
import { AddSubCategoryPanel } from "@/app/components/add-subcategory-panel";
import { AddItemPanel } from "@/app/components/add-item-panel";

type PanelKind = "category" | "subcategory" | "item" | null;

export function Dashboard() {
  const { data: categories, isLoading, error } = useCategories();
  const addCategory = useAddCategory();
  const [activePanel, setActivePanel] = useState<PanelKind>(null);
  const [fabOpen, setFabOpen] = useState(false);

  function openPanel(kind: PanelKind) {
    setFabOpen(false);
    setActivePanel(kind);
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Pantry
          </h1>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <LogOut />
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            Failed to load pantry data. Please try refreshing.
          </div>
        )}

        {categories && (
          <div className="space-y-4">
            {categories.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  No categories yet. Add one to get started.
                </p>
              </div>
            )}

            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}

            <div className="overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
              <AddInline
                placeholder="Add category"
                onAdd={(name) => addCategory.mutate(name)}
              />
            </div>

            {/* Spacer so FAB doesn't overlap last card */}
            <div className="h-16" />
          </div>
        )}
      </main>

      {/* FAB + speed dial */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
        {/* Speed dial options */}
        <div
          className={`flex flex-col items-end gap-2 transition-all ${
            fabOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0"
          }`}
        >
          <button
            onClick={() => openPanel("item")}
            className="flex items-center gap-2 rounded-full bg-white pl-4 pr-5 py-2.5 text-sm font-medium text-zinc-700 shadow-lg ring-1 ring-zinc-200 transition-colors hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700"
          >
            <Plus width={14} height={14} />
            Item
          </button>
          <button
            onClick={() => openPanel("subcategory")}
            className="flex items-center gap-2 rounded-full bg-white pl-4 pr-5 py-2.5 text-sm font-medium text-zinc-700 shadow-lg ring-1 ring-zinc-200 transition-colors hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700"
          >
            <Plus width={14} height={14} />
            Subcategory
          </button>
          <button
            onClick={() => openPanel("category")}
            className="flex items-center gap-2 rounded-full bg-white pl-4 pr-5 py-2.5 text-sm font-medium text-zinc-700 shadow-lg ring-1 ring-zinc-200 transition-colors hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700"
          >
            <Plus width={14} height={14} />
            Category
          </button>
        </div>

        {/* Main FAB */}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition-transform hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 ${
            fabOpen ? "rotate-45" : ""
          }`}
        >
          <Plus width={24} height={24} />
        </button>
      </div>

      {/* Dismiss speed dial when clicking elsewhere */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* Slide-out panels */}
      <AddCategoryPanel
        open={activePanel === "category"}
        onClose={() => setActivePanel(null)}
      />
      <AddSubCategoryPanel
        open={activePanel === "subcategory"}
        onClose={() => setActivePanel(null)}
      />
      <AddItemPanel
        open={activePanel === "item"}
        onClose={() => setActivePanel(null)}
      />
    </div>
  );
}
