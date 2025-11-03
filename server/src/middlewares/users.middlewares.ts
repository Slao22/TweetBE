import { NextFunction, Request, Response } from "express"
import { checkSchema, ParamSchema } from "express-validator"
import { JsonWebTokenError } from "jsonwebtoken"
import { capitalize } from "lodash"
import { ObjectId } from "mongodb"
import { UserVerifyStatus } from "~/constants/enums"
import HTTP_STATUS from "~/constants/httpStatus"
import { USER_MESSAGES } from "~/constants/messages"
import { REGEX_USERNAME } from "~/constants/regex"
import { ErrorWithStatus } from "~/models/Errors"
import { TokenPayload } from "~/models/requests/User.requests"
import databaseService from "~/services/database.service"
import usersService from "~/services/users.service"
import { hashPassword } from "~/utils/crypto"
import { verifyToken } from "~/utils/jwt"
import { validate } from "~/utils/validation"

const passwordSchema: ParamSchema = {
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
}

const confirmPasswordSchema: ParamSchema = {
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
}
const userIdSchema: ParamSchema = {
  custom: {
    options: async (value, { req }) => {
      console.log(value)
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.INVALID_ID_FOLLOWED,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const followed_user = await databaseService.users.findOne({ _id: new ObjectId(value) })
      if (!followed_user) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      return true
    }
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        const { userId } = decoded_forgot_password_token
        const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })
        if (user === null) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: capitalize(error.message),
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}
const imageParamSchema: ParamSchema = {
  optional: true,
  isString: { errorMessage: USER_MESSAGES.IMAGE_MUST_BE_URL },
  trim: true
}
const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.NAME_MUST_BE_STRING
  },
  trim: true,
  isLength: { options: { min: 1, max: 100 }, errorMessage: USER_MESSAGES.NAME_LENGTH_MUST_BE_BETWEEN_1_AND_100 }
}
const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: { strict: true, strictSeparator: true }
  },
  errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error(USER_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: passwordSchema
    },
    ["body"]
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
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
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ["body"]
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      authorization: {
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || "").split(" ")[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ["headers"]
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.REFRESH_TOKEN_IS_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ["body"]
  )
)
export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              ;(req as Request).decode_email_verify_token = decoded_email_verify_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ["body"]
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value
            })
            if (!user) {
              throw new Error(USER_MESSAGES.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ["body"]
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
    },
    ["body"]
  )
)

export const resetPasswordValidator = validate(
  checkSchema({
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    forgot_password_token: forgotPasswordTokenSchema
  })
)

export const verifiedUserValidator = (req: Request, res: any, next: any) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    next(
      new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: { ...nameSchema, optional: true, notEmpty: undefined },
      date_of_birth: { ...dateOfBirthSchema, optional: true },
      bio: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.BIO_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: USER_MESSAGES.BIO_MAX_LENGTH_200
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.LOCATION_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: USER_MESSAGES.LOCATION_MAX_LENGTH_100
        }
      },
      website: {
        optional: true,
        isString: { errorMessage: USER_MESSAGES.WEBSITE_MUST_BE_STRING },
        trim: true,
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: USER_MESSAGES.WEBSITE_MAX_LENGTH_100
        }
      },
      username: {
        optional: true,
        isString: { errorMessage: USER_MESSAGES.USERNAME_MUST_BE_STRING },
        trim: true,
        custom: {
          options: async (value) => {
            if (!REGEX_USERNAME.test(value)) {
              throw Error(USER_MESSAGES.USERNAME_INVALID)
            }
            const user = await databaseService.users.findOne({ username: value })
            if (user) {
              throw Error(USER_MESSAGES.USERNAME_EXISTS)
            }
            return true
          }
        }
      },
      avatar: imageParamSchema,
      cover_photo: imageParamSchema
    },
    ["body"]
  )
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: userIdSchema
    },
    ["body"]
  )
)
export const unFollowValidator = validate(
  checkSchema(
    {
      userId: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.INVALID_ID_FOLLOWED,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const followed_user = await databaseService.users.findOne({ _id: new ObjectId(value) })
            if (!followed_user) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ["params"]
  )
)
export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value, { req }) => {
            const { userId } = req.decoded_authorization as TokenPayload
            const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })
            if (!user) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const { password } = user
            const isMatch = hashPassword(value) === password
            if (!isMatch) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.OLD_PASSWORD_INCORRECT,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
          }
        }
      },
      password: {
        ...passwordSchema,
        custom: {
          options: async (value, { req }) => {
            const { old_password } = req.body
            if (value === old_password) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.PASSWORD_IS_NOT_SAME_AS_OLD,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
          }
        }
      },
      confirm_new_password: confirmPasswordSchema
    },
    ["body"]
  )
)

export const isUserLoggedInValidator = (middleware: (req: Request, res: any, next: NextFunction) => void) => {
  return async (req: Request, res: any, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }
    next()
  }
}
