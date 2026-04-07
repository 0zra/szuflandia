"use server";

import { prisma } from "@/app/lib/db";
import { requireUserId } from "@/app/lib/auth";

type AddItemInput = {
  name: string;
  quantity: number;
  unit: string;
  categoryId?: string;
  subCategoryId?: string;
};

type EditItemInput = {
  id: string;
  name?: string;
  quantity?: number;
  unit?: string;
  categoryId?: string | null;
  subCategoryId?: string | null;
};

/** Verify that a category or subcategory belongs to the user. */
async function verifyOwnership(
  userId: string,
  categoryId?: string | null,
  subCategoryId?: string | null
) {
  if (subCategoryId) {
    const sub = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
      include: { category: { select: { userId: true } } },
    });
    if (!sub || sub.category.userId !== userId) throw new Error("Not found");
    return;
  }
  if (categoryId) {
    const cat = await prisma.category.findUnique({
      where: { id: categoryId, userId },
    });
    if (!cat) throw new Error("Not found");
  }
}

export async function addItem(input: AddItemInput) {
  const userId = await requireUserId();

  if (!input.categoryId && !input.subCategoryId) {
    throw new Error("Item must belong to a category or subcategory");
  }

  await verifyOwnership(userId, input.categoryId, input.subCategoryId);

  return prisma.item.create({
    data: {
      name: input.name.trim(),
      quantity: input.quantity,
      unit: input.unit.trim(),
      categoryId: input.subCategoryId ? null : input.categoryId,
      subCategoryId: input.subCategoryId || null,
    },
  });
}

export async function editItem(input: EditItemInput) {
  const userId = await requireUserId();

  // Verify the existing item belongs to this user
  const item = await prisma.item.findUnique({
    where: { id: input.id },
    include: {
      category: { select: { userId: true } },
      subCategory: { include: { category: { select: { userId: true } } } },
    },
  });
  if (!item) throw new Error("Not found");

  const ownerUserId =
    item.category?.userId ?? item.subCategory?.category.userId;
  if (ownerUserId !== userId) throw new Error("Not found");

  // If moving to a new parent, verify ownership of the target
  if (input.categoryId !== undefined || input.subCategoryId !== undefined) {
    await verifyOwnership(userId, input.categoryId, input.subCategoryId);
  }

  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.quantity !== undefined) data.quantity = input.quantity;
  if (input.unit !== undefined) data.unit = input.unit.trim();
  if (input.categoryId !== undefined) data.categoryId = input.categoryId;
  if (input.subCategoryId !== undefined)
    data.subCategoryId = input.subCategoryId;

  return prisma.item.update({
    where: { id: input.id },
    data,
  });
}

export async function deleteItem(id: string) {
  const userId = await requireUserId();

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      category: { select: { userId: true } },
      subCategory: { include: { category: { select: { userId: true } } } },
    },
  });
  if (!item) throw new Error("Not found");

  const ownerUserId =
    item.category?.userId ?? item.subCategory?.category.userId;
  if (ownerUserId !== userId) throw new Error("Not found");

  await prisma.item.delete({ where: { id } });
  return { id };
}
