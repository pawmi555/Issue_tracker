import { Request } from "express";

import { AuthRequest } from "./auth-request.js";

export interface ValidatedRequest<
  Params = unknown,
  Query = unknown,
  Body = unknown,
> extends Request {
  validatedBody?: Body;
  validatedQuery?: Query;
  validatedParams?: Params;
}

export type ValidatedAuthRequest<
  Params = unknown,
  Query = unknown,
  Body = unknown,
> = AuthRequest & ValidatedRequest<Params, Query, Body>;
