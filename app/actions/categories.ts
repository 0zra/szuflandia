"use server";

import { prisma } from "@/app/lib/db";
import { requireUserId } from "@/app/lib/auth";

export type CategoryWithChildren = {
  id: string;
  name: string;
  userId: string;
  subCategories: {
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
  }[];
  items: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    categoryId: string | null;
    subCategoryId: string | null;
  }[];
};

export async function getCategories(): Promise<CategoryWithChildren[]> {
  const userId = await requireUserId();

  return prisma.category.findMany({
    where: { userId },
    include: {
      subCategories: {
        include: { items: true },
        orderBy: { name: "asc" },
      },
      items: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function addCategory(name: string): Promise<CategoryWithChildren> {
  const userId = await requireUserId();

  return prisma.category.create({
    data: { name: name.trim(), userId },
    include: {
      subCategories: { include: { items: true } },
      items: true,
    },
  });
}

export async function editCategory(
  id: string,
  name: string
): Promise<CategoryWithChildren> {
  const userId = await requireUserId();

  return prisma.category.update({
    where: { id, userId },
    data: { name: name.trim() },
    include: {
      subCategories: { include: { items: true } },
      items: true,
    },
  });
}

export async function deleteCategory(id: string): Promise<{ id: string }> {
  const userId = await requireUserId();

  await prisma.category.delete({ where: { id, userId } });
  return { id };
}
