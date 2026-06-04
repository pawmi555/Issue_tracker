import { AuthRequest } from "./auth-request.js";

export interface ValidatedRequest extends AuthRequest {
  validatedBody?: unknown;
  validatedQuery?: unknown;
  validatedParams?: unknown;
}
