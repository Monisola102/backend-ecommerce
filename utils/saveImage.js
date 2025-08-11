// utils/saveImage.js
import cloudinary from "./cloudinary.js";
import streamifier from "streamifier";

export const saveImage = (file, folder = "products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: folder,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(new Error("Image upload failed"));
        }
        resolve(result);
      }
    );


    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};
