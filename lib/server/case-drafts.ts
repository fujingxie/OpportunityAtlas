import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";
import { caseInputSchema } from "@/lib/server/validation";

export function toCaseCreateInput(value: unknown): Prisma.StudentCaseCreateInput {
  const parsed = caseInputSchema.parse(value);
  const { activityExperience, ...data } = parsed;

  return {
    ...data,
    id: `c-import-${randomUUID()}`,
    activities: {
      create: activityExperience.map((activity, index) => ({
        ...activity,
        order: index
      }))
    }
  };
}
