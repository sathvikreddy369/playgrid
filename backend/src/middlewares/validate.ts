import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Express middleware factory that validates req.body against a Zod schema.
 * On validation failure, returns 400 with structured error details.
 * On success, replaces req.body with the parsed (stripped) output.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and strip unknown fields
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
        res.status(400).json({
          error: 'Validation failed',
          details: messages,
        });
        return;
      }
      next(error);
    }
  };
};
