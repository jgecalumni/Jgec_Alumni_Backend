import fs from "fs"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadOnCloudinary = async (localFilePath: string) => {
     try { 
          if (!localFilePath) return null

          const response = await cloudinary.uploader.upload(localFilePath, {
               resource_type: "image",
               timeout: 10000 // 10 seconds
          })
          //after upload image on cloudinary remove the image from public folder
          fs.unlinkSync(localFilePath) 
          return response
     } catch (error) {
          console.log("Error while uploading image on cloudinary", error)
          fs.unlinkSync(localFilePath)
          return null
     }
}

export const deleteFromCloudinary = async (publicId: string) => {
     try {
          if (!publicId) return null

          await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
     } catch (error) {
          console.log("Error while deleting image from cloudinary", error)
          return error
     }
}