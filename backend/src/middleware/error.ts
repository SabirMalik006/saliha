import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

interface ErrorBody {
  message: string;
  code?: string;
  errors?: Record<string, string>;
}

function fieldsFromZod(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

/** Unknown route. */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(404, `The requested endpoint could not be found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  let status = 500;
  let body: ErrorBody = { message: 'Something went wrong on our side. Please try again.' };

  if (error instanceof ApiError) {
    status = error.status;
    body = {
      message: error.message,
      ...(error.code ? { code: error.code } : {}),
      ...(error.fieldErrors ? { errors: error.fieldErrors } : {}),
    };
  } else if (error instanceof ZodError) {
    status = 422;
    body = {
      message: 'Some of the information provided needs attention.',
      errors: fieldsFromZod(error),
    };
  } else if (error instanceof multer.MulterError) {
    status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 422;
    body = {
      message:
        error.code === 'LIMIT_FILE_SIZE'
          ? `That file is too large. Please upload a file smaller than ${env.maxUploadMb} MB.`
          : 'The uploaded file could not be accepted.',
    };
  } else if (error instanceof mongoose.Error.ValidationError) {
    status = 422;
    const fields: Record<string, string> = {};
    for (const [key, value] of Object.entries(error.errors)) {
      fields[key] = value.message;
    }
    body = { message: 'Some of the information provided needs attention.', errors: fields };
  } else if (error instanceof mongoose.Error.CastError) {
    status = 404;
    body = { message: 'The requested content could not be found.' };
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  ) {
    status = 409;
    const keys = Object.keys(
      (error as { keyPattern?: Record<string, unknown> }).keyPattern ?? {},
    );
    const key = keys[0] ?? 'field';
    body = {
      message: 'This record already exists.',
      errors: { [key]: 'This value is already in use.' },
    };
  }

  if (status >= 500) {
    // Handled 5xx errors (e.g. missing Cloudinary keys) log a short line;
    // anything unexpected logs the full stack for debugging.
    if (error instanceof ApiError) console.error(`[error] ${error.message}`);
    else console.error('[error]', error);
  }

  res.status(status).json(body);
}
