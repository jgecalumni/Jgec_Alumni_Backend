"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadOnCloudinary = void 0;
const fs_1 = __importDefault(require("fs"));
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadOnCloudinary = (localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!localFilePath)
            return null;
        const response = yield cloudinary_1.v2.uploader.upload(localFilePath, {
            resource_type: "image",
            timeout: 10000 // 10 seconds
        });
        //after upload image on cloudinary remove the image from public folder
        fs_1.default.unlinkSync(localFilePath);
        return response;
    }
    catch (error) {
        console.log("Error while uploading image on cloudinary", error);
        fs_1.default.unlinkSync(localFilePath);
        return null;
    }
});
exports.uploadOnCloudinary = uploadOnCloudinary;
const deleteFromCloudinary = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!publicId)
            return null;
        yield cloudinary_1.v2.uploader.destroy(publicId, { resource_type: "image" });
    }
    catch (error) {
        console.log("Error while deleting image from cloudinary", error);
        return error;
    }
});
exports.deleteFromCloudinary = deleteFromCloudinary;
