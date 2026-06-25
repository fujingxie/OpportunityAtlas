import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";
import { programInputSchema } from "@/lib/server/validation";

export function toProgramCreateInput(value: unknown): Prisma.ProgramCreateInput {
  const parsed = programInputSchema.parse(value);

  return {
    ...parsed,
    id: `p-import-${randomUUID()}`,
    officialUrl: parsed.officialUrl || null
  };
}
