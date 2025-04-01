import fs from "fs"
import { v2 as cloudinary } from "cloudinary"
import streamifier from "streamifier"

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
          // fs.unlinkSync(localFilePath)
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

export const uploadMultipleOnCloudinary = async (files: Express.Multer.File[]) => {
     try {
       const uploadPromises = files.map((file) => uploadOnCloudinary(file.path));
       const results = await Promise.all(uploadPromises);
       return results.filter((result) => result !== null);
     } catch (error) {
       console.error("Cloudinary Multiple Upload Error:", error);
       return [];
     }
   };
   export const uploadReceiptToCloudinary = (buffer: Buffer): Promise<string> => {
     return new Promise((resolve, reject) => {
          let stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "receipts" }, // Folder in Cloudinary
            (error, result) => {
              if (error) return reject(error);
              if (result && result.secure_url) {
                resolve(result.secure_url); // Return uploaded file URL
              } else {
                reject(new Error("Upload failed: result is undefined or missing secure_url"));
              }
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
   };