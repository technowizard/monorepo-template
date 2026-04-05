import { z, ZodError } from 'zod';

export const HttpStatus = {
  // success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // client errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  REQUEST_TOO_LONG: 413,
  UNPROCESSABLE_ENTITY: 422,

  // server errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

interface SuccessResponse<T> {
  result: T;
  message: string;
  status: HttpStatusCode;
}

interface ErrorResponse {
  errors: Record<string, string> | null;
  message: string;
  status: HttpStatusCode;
}

export function successResponse<T, S extends HttpStatusCode = typeof HttpStatus.OK>(
  result: T,
  message: string = 'OK',
  status: S = HttpStatus.OK as S
): SuccessResponse<T> & { status: S } {
  return {
    result,
    message,
    status
  } as SuccessResponse<T> & { status: S };
}

export function errorResponse<S extends HttpStatusCode = typeof HttpStatus.INTERNAL_SERVER_ERROR>(
  message: string,
  status: S = HttpStatus.INTERNAL_SERVER_ERROR as S,
  error: unknown = null
): ErrorResponse & { status: S } {
  return {
    errors:
      error instanceof ZodError
        ? Object.fromEntries(error.issues.map((i) => [i.path.join('.'), i.message]))
        : null,
    message,
    status
  } as ErrorResponse & { status: S };
}

export function successResponseSchema<T extends z.ZodType>(
  schema: T,
  status: number = HttpStatus.OK
) {
  return z.object({
    result: schema,
    message: z.string(),
    status: z.number().default(status)
  });
}

const errorSchema = z.record(z.string(), z.string()).nullable();

export function errorResponseSchema(status: number = HttpStatus.INTERNAL_SERVER_ERROR) {
  return z.object({
    errors: errorSchema,
    message: z.string(),
    status: z.number().default(status)
  });
}
