import express from "express";

import { upload } from "../middleware/photo-upload";
import { createCategory, createGalleryImage, deleteCategory, deleteGalleryImage, getAllCategory, getAllGalleryImage, upadateCategory, upadateGalleryImage } from "../controller/gallery.controller";

const router = express.Router();

//category route
router.route("/add-category").post(createCategory);
router.route("/all-category").get(getAllCategory);
router.route("/delete-category/:id").delete(deleteCategory);
router.route("/update-category/:id").patch(upadateCategory);

//gallery image route
router.route("/add-images/:id").post(upload.array("image",20),createGalleryImage);
router.route("/delete-image/:id").delete(deleteGalleryImage);
router.route("/get-all-images").post(getAllGalleryImage);
router.route("/update-image/:id").patch(upload.single("image"),upadateGalleryImage);

export default router;
