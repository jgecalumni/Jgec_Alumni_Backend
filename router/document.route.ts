import express from "express";

import authentication from "../middleware/authentication";
import { upload } from "../middleware/photo-upload";
import {
	addGivingBackDocs,
	addKanchenjungaDocs,
	addScholarshipDocs,
	deleteGivingBackDocs,
	deleteKanchenjungaDocs,
	deleteScholarshipDocs,
	getAllGivingBackDocs,
	getAllKanchenjungaDocs,
	getAllScholarshipDocs,
	updateGivingBackDocs,
	updateKanchenjungaDocs,
	updateScholarshipDocs,
} from "../controller/document.controller";

const router = express.Router();

router.route("/scholarshipDocs").get(getAllScholarshipDocs);
router
	.route("/add/scholarshipDocs")
	.post(authentication, upload.single("file"), addScholarshipDocs);
router
	.route("/update/scholarshipDocs/:id")
	.patch(authentication, upload.single("file"), updateScholarshipDocs);
router
	.route("/delete/scholarshipDocs/:id")
	.delete(authentication, deleteScholarshipDocs);

router.route("/kanchenjungaDocs").get(getAllKanchenjungaDocs);
router
	.route("/add/kanchenjungaDocs")
	.post(authentication, upload.single("file"), addKanchenjungaDocs);
router
	.route("/update/kanchenjungaDocs/:id")
	.patch(authentication, upload.single("file"), updateKanchenjungaDocs);
router
	.route("/delete/kanchenjungaDocs/:id")
	.delete(authentication, deleteKanchenjungaDocs);
router.route("/givingBackDocs").get(getAllGivingBackDocs);
router
	.route("/add/givingBackDocs")
	.post(authentication, upload.single("file"), addGivingBackDocs);
router
	.route("/update/givingBackDocs/:id")
	.patch(authentication, upload.single("file"), updateGivingBackDocs);
router
	.route("/delete/givingBackDocs/:id")
	.delete(authentication, deleteGivingBackDocs);

export default router;
