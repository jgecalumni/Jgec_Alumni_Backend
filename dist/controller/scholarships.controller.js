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
exports.deleteApplication = exports.applyForScholarship = exports.applicantDetails = exports.getAllScholarshipApplications = exports.deleteScholarship = exports.updateScholarship = exports.addNewScholarship = exports.getScholarshipById = exports.getAllScholarships = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const asyncHandler_1 = require("../utils/asyncHandler");
// all scholarships controller functions - create, update, delete and get all scholarships
exports.getAllScholarships = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, search } = req.query;
    const count = yield prisma_1.default.scholarships.count();
    const scholarships = yield prisma_1.default.scholarships.findMany({
        take: Number(limit) || 10,
        skip: (Number(page) - 1) * Number(limit) || 0,
        // search name if search keyword exist
        where: {
            name: {
                contains: search || ""
            }
        },
        select: {
            id: true,
            name: true,
            providerId: true,
            provider: {
                select: {
                    name: true,
                    photo: true,
                    passingYear: true,
                    department: true,
                }
            },
            providerDescription: true,
            description: true,
            whoCanApply: true,
            whenToApply: true,
            ageLimit: true,
            amountDetails: true,
            scholarshipApplicants: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    mobile: true,
                    department: true,
                    hsPercentage: true,
                    btechResults: true,
                }
            }
        }
    });
    res.status(200).json({
        message: "Scholarships fetched successfully",
        scholarships,
        error: false,
        success: true,
        docCount: count,
        totalPages: Math.ceil(count / (Number(limit) || 10)),
        page: Number(page) || 1,
        limit: Number(limit) || 10
    });
}));
exports.getScholarshipById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Fetch scholarship details by scholarshipId
    const scholarship = yield prisma_1.default.scholarships.findUnique({
        where: {
            id: Number(id)
        },
        select: {
            id: true,
            name: true,
            providerId: true,
            provider: {
                select: {
                    name: true,
                    photo: true,
                    passingYear: true,
                    department: true,
                }
            },
            providerDescription: true,
            description: true,
            whoCanApply: true,
            whenToApply: true,
            ageLimit: true,
            amountDetails: true,
            scholarshipApplicants: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    mobile: true,
                    department: true,
                    hsPercentage: true,
                    btechResults: true,
                }
            }
        }
    });
    // If no scholarship is found
    if (!scholarship) {
        res.status(404).json({ success: false, message: "Scholarship not found", error: true });
        return;
    }
    res.status(200).json({
        message: "Scholarship fetched successfully",
        data: scholarship,
        error: false,
        success: true,
    });
}));
exports.addNewScholarship = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, providerId, providerDescription, description, whoCanApply, whenToApply, ageLimit, amountDetails } = req.body;
    if (!(name && providerDescription && description && whoCanApply && whenToApply && ageLimit && amountDetails)) {
        res.status(400).json({
            success: false,
            message: "Please provide all required fields",
            error: true
        });
        return;
    }
    // Check if scholarship already exists
    const updateName = String(name).toLowerCase().trim();
    const isExist = yield prisma_1.default.scholarships.findFirst({ where: { name: updateName } });
    if (isExist) {
        res.status(400).json({
            success: false,
            message: "Scholarship already exists",
            error: true
        });
        return;
    }
    // Create new scholarship
    const newScholarship = yield prisma_1.default.scholarships.create({
        data: {
            name: updateName,
            providerId: parseInt(providerId),
            providerDescription,
            description,
            whoCanApply,
            whenToApply,
            ageLimit,
            amountDetails
        },
        select: {
            id: true,
            name: true,
            providerId: true,
            provider: {
                select: {
                    name: true,
                    photo: true,
                    passingYear: true,
                    department: true,
                }
            },
            providerDescription: true,
            description: true,
            whoCanApply: true,
            whenToApply: true,
            ageLimit: true,
            amountDetails: true
        }
    });
    res.status(201).json({
        message: "Scholarship added successfully",
        data: newScholarship,
        error: false,
        success: true
    });
}));
exports.updateScholarship = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, providerId, providerDescription, description, whoCanApply, whenToApply, ageLimit, amountDetails } = req.body;
    const { id } = req.params;
    //  Check if all required fields are provided
    if (!(name && providerDescription && description && whoCanApply && whenToApply && ageLimit && amountDetails)) {
        res.status(400).json({
            success: false,
            message: "Please provide all required fields",
            error: true
        });
        return;
    }
    // Check if scholarship already exists 
    const isExist = yield prisma_1.default.scholarships.findFirst({ where: { id: parseInt(id) } });
    if (!isExist) {
        res.status(404).json({
            success: false,
            message: "Scholarship is not exists",
            error: true
        });
        return;
    }
    // Update scholarship
    const updatedScholarship = yield prisma_1.default.scholarships.update({
        where: { id: parseInt(id) },
        data: {
            name,
            providerId: parseInt(providerId),
            providerDescription,
            description,
            whoCanApply,
            whenToApply,
            ageLimit,
            amountDetails
        },
        select: {
            id: true,
            name: true,
            providerId: true,
            provider: {
                select: {
                    name: true,
                    photo: true,
                    passingYear: true,
                    department: true,
                }
            },
            providerDescription: true,
            description: true,
            whoCanApply: true,
            whenToApply: true,
            ageLimit: true,
            amountDetails: true
        }
    });
    res.status(201).json({
        message: "Scholarship updated successfully",
        data: updatedScholarship,
        error: false,
        success: true
    });
}));
exports.deleteScholarship = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Check if scholarship already exists
    const isExist = yield prisma_1.default.scholarships.findFirst({ where: { id: Number(id) } });
    if (!isExist) {
        res.status(404).json({
            success: false,
            message: "Scholarship is not exists",
            error: true
        });
        return;
    }
    // Delete scholarship
    yield prisma_1.default.scholarships.delete({ where: { id: Number(id) } });
    res.status(200).json({
        message: "Scholarship deleted successfully",
        error: false,
        success: true
    });
}));
// apply for scholarship controller functions - create, update, delete and get all applications
exports.getAllScholarshipApplications = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, search, scholarshipId } = req.query;
    const totalCount = yield prisma_1.default.scholarshipApplication.count();
    const allApplications = yield prisma_1.default.scholarshipApplication.findMany({
        take: Number(limit) || 10,
        skip: (Number(page) - 1) * Number(limit) || 0,
        where: {
            scholarshipId: {
                equals: parseInt(scholarshipId) || 0
            },
            name: {
                contains: search || "",
            }
        },
        select: {
            id: true,
            name: true,
            studentId: true,
            dob: true,
            homeContactNo: true,
            email: true,
            mobile: true,
            fatherOccupation: true,
            noOfFamilyMembers: true,
            noOfEarningMembers: true,
            familyIncome: true,
            earningPerMember: true,
            collegeIntakeYear: true,
            extraCurricularActivities: true,
            address: true,
            hsPercentage: true,
            btechResults: true,
            department: true,
            achievements: true,
            jobDetails: true,
            scholarshipDetails: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    provider: {
                        select: {
                            name: true,
                            photo: true,
                            passingYear: true,
                            department: true,
                        }
                    },
                }
            }
        }
    });
    res.status(200).json({
        message: "Scholarship applications fetched successfully",
        data: allApplications,
        error: false,
        success: true,
        docCount: allApplications.length,
        totalPages: Math.ceil(totalCount / (Number(limit) || 10)),
        page: Number(page) || 1,
        limit: Number(limit) || 10
    });
}));
exports.applicantDetails = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const applicant = yield prisma_1.default.scholarshipApplication.findFirst({
        where: { id: parseInt(id) },
        select: {
            id: true,
            name: true,
            studentId: true,
            dob: true,
            homeContactNo: true,
            email: true,
            mobile: true,
            fatherOccupation: true,
            noOfFamilyMembers: true,
            noOfEarningMembers: true,
            familyIncome: true,
            earningPerMember: true,
            collegeIntakeYear: true,
            extraCurricularActivities: true,
            address: true,
            hsPercentage: true,
            btechResults: true,
            department: true,
            achievements: true,
            jobDetails: true,
            scholarshipDetails: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    provider: {
                        select: {
                            name: true,
                            photo: true,
                            passingYear: true,
                            department: true,
                        }
                    },
                }
            }
        }
    });
    if (!applicant) {
        res.status(404).json({
            success: false,
            message: "Applicant details not found",
            error: true
        });
        return;
    }
    res.status(200).json({
        message: "Applicant details fetched successfully",
        data: applicant,
        error: false,
        success: true
    });
}));
exports.applyForScholarship = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, scholarshipId, studentId, dob, homeContactNo, email, mobile, fatherOccupation, noOfFamilyMembers, noOfEarningMembers, familyIncome, earningPerMember, collegeIntakeYear, extraCurricularActivities, address, hsPercentage, btechResults, // "1st sem: 8.5, 2nd sem: 8.5, 3rd sem: 8.5, 4th sem: 8.5, 5th sem: 8.5, 6th sem: 8.5, 7th sem: 8.5, 8th sem: 8.5"
    department, achievements, jobDetails, } = req.body;
    // Check if all required fields are provided
    if (!(name && scholarshipId && studentId && dob && email && mobile && fatherOccupation && noOfFamilyMembers && familyIncome && earningPerMember && collegeIntakeYear && address && hsPercentage && btechResults && department)) {
        res.status(400).json({
            success: false,
            message: "Please provide all required fields",
            error: true
        });
        return;
    }
    // Check if user already applied for scholarship
    const isExist = yield prisma_1.default.scholarships.findFirst({
        where: {
            scholarshipApplicants: {
                some: {
                    studentId: studentId
                }
            }
        }
    });
    if (isExist) {
        res.status(400).json({
            success: false,
            message: "You already applied for this scholarship",
            error: true
        });
        return;
    }
    // Create new scholarship application
    const newScholarshipApplication = yield prisma_1.default.scholarshipApplication.create({
        data: {
            name,
            scholarshipId: parseInt(scholarshipId),
            studentId,
            dob,
            homeContactNo,
            email,
            mobile,
            fatherOccupation,
            noOfFamilyMembers,
            noOfEarningMembers,
            familyIncome,
            earningPerMember,
            collegeIntakeYear,
            extraCurricularActivities,
            address,
            hsPercentage,
            btechResults,
            department,
            achievements,
            jobDetails
        },
        select: {
            id: true,
            name: true,
            studentId: true,
            dob: true,
            homeContactNo: true,
            email: true,
            mobile: true,
            fatherOccupation: true,
            noOfFamilyMembers: true,
            noOfEarningMembers: true,
            familyIncome: true,
            earningPerMember: true,
            collegeIntakeYear: true,
            extraCurricularActivities: true,
            address: true,
            hsPercentage: true,
            btechResults: true,
            department: true,
            achievements: true,
            jobDetails: true,
            scholarshipDetails: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    provider: {
                        select: {
                            name: true,
                            photo: true,
                            passingYear: true,
                            department: true,
                        }
                    },
                }
            }
        }
    });
    res.status(201).json({
        message: "Scholarship applied successfully",
        data: newScholarshipApplication,
        error: false,
        success: true
    });
}));
exports.deleteApplication = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield prisma_1.default.scholarshipApplication.delete({ where: { id: parseInt(id) } });
    res.status(200).json({
        message: "Application deleted successfully",
        error: false,
        success: true
    });
}));
