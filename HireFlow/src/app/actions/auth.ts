"use server";

import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";

export async function registerUser(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { name, email, password, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return { error: "Email already registered" };
  }

  const passwordHash = await hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role as "CANDIDATE" | "COMPANY",
      ...(role === "CANDIDATE"
        ? { candidateProfile: { create: {} } }
        : {}),
    },
  });

  return { success: true, userId: user.id };
}
