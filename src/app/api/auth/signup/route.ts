import { PrismaClient } from "@/lib/prisma";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
  }

  const hashedPassword = await hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  return new Response(JSON.stringify({ message: "User created" }), { status: 201 });
}
