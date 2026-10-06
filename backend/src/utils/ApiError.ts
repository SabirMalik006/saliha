/**
 * Error thrown by route handlers. The error middleware turns this into the
 * `{ message, errors? }` JSON shape the frontend already understands.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    options: { code?: string; fieldErrors?: Record<string, string> } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options.code;
    this.fieldErrors = options.fieldErrors;
  }

  static badRequest(message: string, fieldErrors?: Record<string, string>) {
    return new ApiError(400, message, { fieldErrors });
  }

  static unauthorised(message = 'Authentication required.') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You do not have permission to perform this action.') {
    return new ApiError(403, message);
  }

  static notFound(message = 'The requested content could not be found.') {
    return new ApiError(404, message);
  }

  static conflict(message: string, fieldErrors?: Record<string, string>) {
    return new ApiError(409, message, { fieldErrors });
  }

  static unprocessable(message: string, fieldErrors?: Record<string, string>) {
    return new ApiError(422, message, { fieldErrors });
  }
}
