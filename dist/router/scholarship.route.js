"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const scholarships_controller_1 = require("../controller/scholarships.controller");
const authentication_1 = __importDefault(require("../middleware/authentication"));
const router = express_1.default.Router();
// Routes for scholarships
router.route('/').get(scholarships_controller_1.getAllScholarships);
router.route('/:id').get(scholarships_controller_1.getScholarshipById);
router.route('/add').post(authentication_1.default, scholarships_controller_1.addNewScholarship);
router.route('/update/:id').patch(authentication_1.default, scholarships_controller_1.updateScholarship);
router.route('/delete/:id').delete(authentication_1.default, scholarships_controller_1.deleteScholarship);
// Routes for scholarship applications
router.route('/applications/all').get(scholarships_controller_1.getAllScholarshipApplications);
router.route('/applicant/:id').get(scholarships_controller_1.applicantDetails);
router.route('/apply').post(scholarships_controller_1.applyForScholarship);
router.route('/applicants/delete/:id').post(authentication_1.default, scholarships_controller_1.deleteApplication);
exports.default = router;
