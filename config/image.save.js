const mediaPath = process.env.MEDIA_PATH;
const path = require("path");
const fs = require("fs");
const cloudinary = require("./cloudinary");
const streamifier = require("streamifier");
const imageSave = async (url, file) => {
  try {
    const files = file;
    const uploadFromBuffer = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: url,
            transformation: [
              { width: 360, height: 240, crop: "limit" }, // Resize to fit within 800x600 pixels
              { quality: "auto", fetch_format: "auto" }, // Automatically adjust quality and format
            ],
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await uploadFromBuffer(files.buffer);
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
// const imageSave = async (url, file, image) => {
//   try {
//     const imageFile = file.buffer;
//     const files = file;
//     let fileName;
//     const fileExtension = files.originalname.split(".").pop();
//     fileName = `${Date.now()}.${fileExtension}`;
//     const imageFilePath = path.join(
//       __dirname,
//       `${mediaPath}${url}/${fileName}`
//     );
//     fs.writeFileSync(imageFilePath, imageFile);
//     return fileName;
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// };
const deleteImage = async (image) => {
  try {
    const currentFilePath = path.join(__dirname, `${mediaPath}/${image}`);
    if (fs.existsSync(currentFilePath)) {
      fs.unlinkSync(currentFilePath);
      return true;
    } else {
      return true;
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
module.exports = { imageSave, deleteImage };
