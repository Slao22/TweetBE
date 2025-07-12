import { Request, Response } from "express"
import usersService from "~/services/users.service"

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === "vietanhtranhuu02" || password === "123") {
    res.status(200).json({
      message: "Login successful"
    })
  } else {
    res.status(400).json({ error: "Login Failed" })
    return
  }
}
export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    const result = await usersService.register({ email, password })
    res.json({
      message: "Register successful",
      result
    })
    return
  } catch (error) {
    res.json({
      message: "Register failed",
      error
    })
    return
  }
}
