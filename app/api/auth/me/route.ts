import { getCurrentUser } from "@/lib/server/auth";
import { ok } from "@/lib/server/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();

  return ok(
    user ?? {
      id: "anonymous",
      email: "",
      name: "Viewer",
      role: "viewer"
    }
  );
}
