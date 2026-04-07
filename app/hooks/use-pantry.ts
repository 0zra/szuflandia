"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  addCategory,
  editCategory,
  deleteCategory,
  type CategoryWithChildren,
} from "@/app/actions/categories";
import {
  addSubCategory,
  editSubCategory,
  deleteSubCategory,
} from "@/app/actions/subcategories";
import { addItem, editItem, deleteItem } from "@/app/actions/items";

const CATEGORIES_KEY = ["categories"] as const;

// ---------------------------------------------------------------------------
// Query: fetch all categories (with nested subcategories & items)
// ---------------------------------------------------------------------------

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => getCategories(),
  });
}

// ---------------------------------------------------------------------------
// Category mutations
// ---------------------------------------------------------------------------

export function useAddCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => addCategory(name),
    onSuccess: (created) => {
      qc.setQueryData<CategoryWithChildren[]>(CATEGORIES_KEY, (old) =>
        old ? [...old, created].sort((a, b) => a.name.localeCompare(b.name)) : [created]
      );
    },
  });
}

export function useEditCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      editCategory(id, name),
    onSuccess: (updated) => {
      qc.setQueryData<CategoryWithChildren[]>(CATEGORIES_KEY, (old) =>
        old
          ? old
              .map((c) => (c.id === updated.id ? updated : c))
              .sort((a, b) => a.name.localeCompare(b.name))
          : old
      );
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: ({ id }) => {
      qc.setQueryData<CategoryWithChildren[]>(CATEGORIES_KEY, (old) =>
        old ? old.filter((c) => c.id !== id) : old
      );
    },
  });
}

// ---------------------------------------------------------------------------
// SubCategory mutations
// ---------------------------------------------------------------------------

export function useAddSubCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      name,
    }: {
      categoryId: string;
      name: string;
    }) => addSubCategory(categoryId, name),
    onSuccess: (created) => {
      qc.setQueryData<CategoryWithChildren[]>(CATEGORIES_KEY, (old) =>
        old
          ? old.map((c) =>
              c.id === created.categoryId
                ? {
                    ...c,
                    subCategories: [...c.subCategories, { ...created }].sort(
                      (a, b) => a.name.localeCompare(b.name)
                    ),
                  }
                : c
            )
          : old
      );
    },
  });
}

export function useEditSubCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      editSubCategory(id, name),
    onSuccess: (updated) => {
      qc.setQueryData<CategoryWithChildren[]>(CATEGORIES_KEY, (old) =>
        old
          ? old.map((c) =>
              c.id === updated.categoryId
                ? {
                    ...c,
                    subCategories: c.subCategories
                      .map((s) => (s.id === updated.id ? updated : s))
                      .sort((a, b) => a.name.localeCompare(b.name)),
                  }
                : c
            )
          : old
      );
    },
  });
}

export function useDeleteSubCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubCategory(id),
    onSuccess: ({ id }) => {
      qc.setQueryData<CategoryWithChildren[]>(CATEGORIES_KEY, (old) =>
        old
          ? old.map((c) => ({
              ...c,
              subCategories: c.subCategories.filter((s) => s.id !== id),
            }))
          : old
      );
    },
  });
}

// ---------------------------------------------------------------------------
// Item mutations (with optimistic update for quantity changes)
// ---------------------------------------------------------------------------

type AddItemInput = {
  name: string;
  quantity: number;
  unit: string;
  categoryId?: string;
  subCategoryId?: string;
};

export function useAddItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddItemInput) => addItem(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

type EditItemInput = {
  id: string;
  name?: string;
  quantity?: number;
  unit?: string;
  categoryId?: string | null;
  subCategoryId?: string | null;
};

function applyItemEdit(
  categories: CategoryWithChildren[],
  input: EditItemInput
): CategoryWithChildren[] {
  return categories.map((c) => ({
    ...c,
    items: c.items.map((i) =>
      i.id === input.id ? { ...i, ...input } : i
    ),
    subCategories: c.subCategories.map((s) => ({
      ...s,
      items: s.items.map((i) =>
        i.id === input.id ? { ...i, ...input } : i
      ),
    })),
  }));
}

export function useEditItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EditItemInput) => editItem(input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: CATEGORIES_KEY });
      const previous =
        qc.getQueryData<CategoryWithChildren[]>(CATEGORIES_KEY);

      if (previous) {
        qc.setQueryData<CategoryWithChildren[]>(
          CATEGORIES_KEY,
          applyItemEdit(previous, input)
        );
      }

      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        qc.setQueryData(CATEGORIES_KEY, context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: ({ id }) => {
      qc.setQueryData<CategoryWithChildren[]>(CATEGORIES_KEY, (old) =>
        old
          ? old.map((c) => ({
              ...c,
              items: c.items.filter((i) => i.id !== id),
              subCategories: c.subCategories.map((s) => ({
                ...s,
                items: s.items.filter((i) => i.id !== id),
              })),
            }))
          : old
      );
    },
  });
}
