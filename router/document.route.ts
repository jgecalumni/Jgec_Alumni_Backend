import express from "express";

import authentication from "../middleware/authentication";
import { upload } from "../middleware/photo-upload";
import { addScholarshipDocs, deleteScholarshipDocs, getAllScholarshipDocs, updateScholarshipDocs } from "../controller/document.controller";

const router = express.Router();

router.route('/scholarshipDocs').get(getAllScholarshipDocs);
// router.route('/:id').get(noticeDetails);
router.route('/add/scholarshipDocs').post(authentication,upload.single('file'), addScholarshipDocs);
router.route('/update/scholarshipDocs/:id').patch(authentication, upload.single('file'), updateScholarshipDocs);
router.route('/delete/scholarshipDocs/:id').delete(authentication, deleteScholarshipDocs);


export default router;