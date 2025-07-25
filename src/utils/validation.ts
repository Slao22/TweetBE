import express from "express"
import { validationResult, ValidationChain } from "express-validator"
import { RunnableValidationChains } from "express-validator/lib/middlewares/schema"
import HTTP_STATUS from "~/constants/httpStatus"
import { EntityError, ErrorWithStatus } from "~/models/Errors"

// can be reused by many routes
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // sequential processing, stops running validations chain if one fails.
    await validation.run(req)

    const errors = validationResult(req)
    // No errors, continue to the next middleware
    if (errors.isEmpty()) {
      return next()
    }
    // If there are errors, create an EntityError and pass it to the next middleware
    const errorsObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = errorsObject[key]
    }
    return next(entityError)
  }
}
