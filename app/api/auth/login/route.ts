import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/server/db";
import { attachSessionCookie, createSession } from "@/lib/server/auth";
import { fail, ok } from "@/lib/server/api-response";
import { serializeUser } from "@/lib/server/serializers";
import { loginSchema, readJson } from "@/lib/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "邮箱或密码格式不正确", 400, parsed.error.flatten());
  }

  const user = await getPrisma().user.findUnique({
    where: {
      email: parsed.data.email.toLowerCase()
    }
  });

  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return fail("INVALID_CREDENTIALS", "邮箱或密码错误", 401);
  }

  const session = await createSession(user.id);
  const response = ok(serializeUser(user));
  attachSessionCookie(response, session);

  return response;
}
