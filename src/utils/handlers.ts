import { Request, Response, NextFunction, RequestHandler } from "express"

export function wrapRequestHandler(func: RequestHandler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error) // Pass the error to the next middleware
    }
  }
}
