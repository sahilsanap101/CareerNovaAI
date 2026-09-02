import type { TokenPayload } from '@pathforge/shared-types';

declare global {
  namespace Express {
    interface Request {
      /**
       * The decoded JWT payload attached by the authenticate middleware.
       * Only present on protected routes.
       */
      user?: TokenPayload;
    }
  }
}

export {};
