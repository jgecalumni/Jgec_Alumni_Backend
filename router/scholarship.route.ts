
import express from "express";
import { addNewScholarship, applicantDetails, applyForScholarship, deleteApplication, deleteScholarship, getAllScholarshipApplications, getAllScholarships, getScholarshipById, updateScholarship } from "../controller/scholarships.controller";

const router = express.Router();

// Routes for scholarships
router.route('/').get(getAllScholarships);
router.route('/:id').get(getScholarshipById);
router.route('/add').post(addNewScholarship);
router.route('/update/:id').patch(updateScholarship);
router.route('/delete/:id').delete(deleteScholarship);

// Routes for scholarship applications
router.route('/applications/all').get(getAllScholarshipApplications);
router.route('/applicant/:id').get(applicantDetails);
router.route('/apply').post(applyForScholarship);
router.route('/applicants/delete/:id').post(deleteApplication);

export default router;