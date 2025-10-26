import { Request } from "express"
import { File } from "formidable"
import fs from "fs"
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from "~/constants/dir"
export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      // tao folder  nested neu chua ton tai
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

export const handleUploadImage = async (req: Request) => {
  //fix error cannot find module ES Module
  const formidable = (await import("formidable")).default
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    keepExtensions: true,
    maxFiles: 5,
    maxFileSize: 3 * 1024 * 1024,
    maxTotalFileSize: 5 * 3 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === "image" && Boolean(mimetype?.includes("image"))
      if (!valid) {
        form.emit("error" as any, new Error("Invalid file type") as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error("File is empty"))
      }
      resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  //fix error cannot find module ES Module
  const formidable = (await import("formidable")).default
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === "video" && Boolean(mimetype?.includes("mp4") || mimetype?.includes("quicktime"))
      if (!valid) {
        form.emit("error" as any, new Error("Invalid file type") as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        return reject(new Error("File is empty"))
      }
      //library error so i code this logic for extension
      const videos = files.video as File[]
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string)
        fs.renameSync(video.filepath, video.filepath + "." + ext)
        video.newFilename = video.newFilename + "." + ext
      })
      resolve(files.video as File[])
    })
  })
}

export const getNameFromFullNamePath = (fullname: string) => {
  const nameArr = fullname.split(".")
  nameArr.pop()
  return nameArr.join("")
}

export const getExtension = (fullname: string) => {
  const nameArr = fullname.split(".")
  return nameArr[nameArr.length - 1]
}
