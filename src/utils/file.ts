import { Request } from "express"
import fs from "fs"
import path from "path"
export const initFolder = () => {
  const uploadFolderPath = path.resolve("./uploads")
  if (!fs.existsSync(uploadFolderPath)) {
    // tao folder  nested neu chua ton tai
    fs.mkdirSync(uploadFolderPath, { recursive: true })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  //fix error cannot find module ES Module
  const formidable = (await import("formidable")).default
  const form = formidable({
    uploadDir: path.resolve("./uploads"),
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 3 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === "image" && Boolean(mimetype?.includes("image"))
      if (!valid) {
        form.emit("error" as any, new Error("Invalid file type") as any)
      }
      return valid
    }
  })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error("File is empty"))
      }
      resolve({ message: "Upload successful", files })
    })
  })
}
