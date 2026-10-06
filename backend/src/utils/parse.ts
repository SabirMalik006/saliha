import { ZodError, type ZodTypeAny, type z } from 'zod';
import { ApiError } from './ApiError';

/**
 * Parses input with a zod schema, returning the inferred output type and
 * converting failures into a 422 ApiError with per-field messages.
 */
export function parseOrThrow<S extends ZodTypeAny>(
  schema: S,
  input: unknown,
): z.infer<S> {
  try {
    return schema.parse(input) as z.infer<S>;
  } catch (error) {
    if (error instanceof ZodError) {
      const fields: Record<string, string> = {};
      for (const issue of error.issues) {
        const key = String(issue.path[0] ?? 'form');
        if (!fields[key]) fields[key] = issue.message;
      }
      throw ApiError.unprocessable(
        'Some of the information provided needs attention.',
        fields,
      );
    }
    throw error;
  }
}
