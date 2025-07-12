import { Request, Response, NextFunction } from "express"

export const loginValidation = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" })
    return
  }

  next()
}

export const registerValidation = (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email, and password are required" })
  }
  next()
}
