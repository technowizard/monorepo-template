import type { z } from '@hono/zod-openapi';
import { ZodError, type z as z4 } from 'zod/v4';

export function toZodOpenApiSchema<T extends z4.ZodTypeAny>(zodSchema: T) {
  return zodSchema as unknown as z.ZodType<z4.infer<T>>;
}

export function formatZodError(err: ZodError) {
  return {
    errors: Object.fromEntries(err.issues.map((issue) => [issue.path.join('.'), issue.message]))
  };
}

export type ZodSchema = z.ZodUnion | z.ZodType<object> | z.ZodArray<z.ZodType<object>>;
