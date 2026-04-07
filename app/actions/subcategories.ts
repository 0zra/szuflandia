"use server";

import { prisma } from "@/app/lib/db";
import { requireUserId } from "@/app/lib/auth";

export async function addSubCategory(categoryId: string, name: string) {
  const userId = await requireUserId();

  // Verify the category belongs to this user
  const category = await prisma.category.findUnique({
    where: { id: categoryId, userId },
  });
  if (!category) throw new Error("Category not found");

  return prisma.subCategory.create({
    data: { name: name.trim(), categoryId },
    include: { items: true },
  });
}

export async function editSubCategory(id: string, name: string) {
  const userId = await requireUserId();

  // Verify ownership through the parent category
  const sub = await prisma.subCategory.findUnique({
    where: { id },
    include: { category: { select: { userId: true } } },
  });
  if (!sub || sub.category.userId !== userId) throw new Error("Not found");

  return prisma.subCategory.update({
    where: { id },
    data: { name: name.trim() },
    include: { items: true },
  });
}

export async function deleteSubCategory(id: string) {
  const userId = await requireUserId();

  const sub = await prisma.subCategory.findUnique({
    where: { id },
    include: { category: { select: { userId: true } } },
  });
  if (!sub || sub.category.userId !== userId) throw new Error("Not found");

  await prisma.subCategory.delete({ where: { id } });
  return { id };
}
