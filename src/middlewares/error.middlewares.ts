import { Request, Response, NextFunction } from "express"
import { omit } from "lodash"
import HTTP_STATUS from "~/constants/httpStatus"
import { ErrorWithStatus } from "~/models/Errors"

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    res.status(err.status).json(omit(err, ["status"]))
    return
  }
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message, errorInfo: omit(err, ["stack"]) })
}
