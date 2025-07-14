import { Request, Response, NextFunction } from "express"
import { checkSchema } from "express-validator"
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
      notEmpty: true,
      trim: true,
      isString: true,
      isLength: { options: { min: 1, max: 100 } }
    },
    email: {
      isEmail: true,
      notEmpty: true,
      trim: true,
      custom: {
        options: async (value) => {
          return await usersService.checkEmailExists(value).then((exists) => {
            if (exists) {
              throw new Error("Email already exists")
            }
            return true
          })
        }
      }
    },
    password: {
      notEmpty: true,
      isLength: { options: { min: 6, max: 100 } },
      isString: true,
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      errorMessage:
        "Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol."
    },
    confirm_password: {
      notEmpty: true,
      isLength: { options: { min: 6, max: 100 } },
      isString: true,
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      errorMessage:
        "Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol.",
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            console.log(req.body.password, value)
            throw new Error("Passwords do not match")
          }
          return true
        }
      }
    },

    date_of_birth: {
      isISO8601: {
        options: { strict: true, strictSeparator: true }
      }
    }
  })
)
