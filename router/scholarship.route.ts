import express from "express";
import {
	addNewScholarship,
	applicantDetails,
	applyForScholarship,
	deleteApplication,
	deleteScholarship,
	getAllScholarshipApplications,
	getAllScholarships,
	getScholarshipById,
	updateScholarship,
} from "../controller/scholarships.controller";
import authentication from "../middleware/authentication";
import { upload } from "../middleware/photo-upload";

const router = express.Router();

// Routes for scholarships
router.route("/").get(getAllScholarships);
router.route("/:id").get(getScholarshipById);
router
	.route("/add")
	.post(authentication, upload.single("providerImage"), addNewScholarship);
router
	.route("/update/:id")
	.patch(authentication, upload.single("providerImage"), updateScholarship);
router.route("/delete/:id").delete(authentication, deleteScholarship);

// Routes for scholarship applications
router.route("/applications/all").get(getAllScholarshipApplications);
router.route("/applicant/:id").get(applicantDetails);
router.route("/apply").post(applyForScholarship);
router.route("/applicants/delete/:id").post(authentication, deleteApplication);

export default router;
