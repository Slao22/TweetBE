import { Request, Response, NextFunction } from "express"
import { checkSchema } from "express-validator"
import { USER_MESSAGES } from "~/constants/messages"
import { ErrorWithStatus } from "~/models/Errors"
import usersService from "~/services/users.service"
import { validate } from "~/utils/validation"
export const loginValidation = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" })
    return
  }

  next()
}

export const registerValidation = validate(
  checkSchema({
    name: {
      notEmpty: {
        errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
      },
      trim: true,
      isString: {
        errorMessage: USER_MESSAGES.NAME_MUST_BE_STRING
      },
      isLength: { options: { min: 1, max: 100 }, errorMessage: USER_MESSAGES.NAME_LENGTH_MUST_BE_BETWEEN_1_AND_100 }
    },
    email: {
      isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
      },
      notEmpty: {
        errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
      },
      trim: true,
      custom: {
        options: async (value) => {
          return await usersService.checkEmailExists(value).then((exists) => {
            if (exists) {
              throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          })
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
      },
      isLength: {
        options: { min: 6, max: 100 },
        errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_100
      },
      isString: {
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRING
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
      }
    },
    confirm_password: {
      notEmpty: { errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED },
      isLength: {
        options: { min: 6, max: 100 },
        errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_100
      },
      isString: { errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_MATCH)
          }
          return true
        }
      }
    },

    date_of_birth: {
      isISO8601: {
        options: { strict: true, strictSeparator: true }
      },
      errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
    }
  })
)
