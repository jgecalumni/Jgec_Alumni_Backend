import { Request, Response } from "express";
import prisma from "../prisma";
import { asyncHandler } from "../utils/asyncHandler";

// all scholarships controller functions - create, update, delete and get all scholarships

export const getAllScholarships = asyncHandler(async (req: Request, res: Response) => {
    const { limit, page, search } = req.query;

    const scholarships = await prisma.scholarships.findMany({
        take: Number(limit) || 10,
        skip: (Number(page) - 1) * Number(limit) || 0,
        // search name if search keyword exist
        where: {
            name: {
                contains: (search as string) || ""
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
            applyLink: true,
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

    // If no scholarships are found
    if (!scholarships.length) {
        res.status(404).json({ success: false, message: "No scholarships found", error: true });
        return;
    }

    res.status(200).json({
        message: "Scholarships fetched successfully",
        data: scholarships,
        error: false,
        success: true,
        docCount: scholarships.length,
        totalPages: Math.ceil(scholarships.length / (Number(limit) || 10)),
        page: Number(page) || 1,
        limit: Number(limit) || 10
    });
});

export const getScholarshipById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Fetch scholarship details by scholarshipId
    const scholarship = await prisma.scholarships.findUnique({
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
            applyLink: true,
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
});

export const addNewScholarship = asyncHandler(async (req: Request, res: Response) => {
    const { name, providerId, providerDescription, description, whoCanApply, whenToApply, applyLink, ageLimit, amountDetails } = req.body;

    if (!(name && providerDescription && description && whoCanApply && whenToApply && applyLink && ageLimit && amountDetails)) {
        res.status(400).json({
            success: false,
            message: "Please provide all required fields",
            error: true
        });
        return;
    }

    // Check if scholarship already exists
    const updateName = String(name).toLowerCase().trim();
    const isExist = await prisma.scholarships.findFirst({ where: { name: updateName } });

    if (isExist) {
        res.status(400).json({
            success: false,
            message: "Scholarship already exists",
            error: true
        });
        return;
    }

    // Create new scholarship
    const newScholarship = await prisma.scholarships.create({
        data: {
            name: updateName,
            providerId: parseInt(providerId),
            providerDescription,
            description,
            whoCanApply,
            whenToApply,
            applyLink,
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
            applyLink: true,
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
});

export const updateScholarship = asyncHandler(async (req: Request, res: Response) => {
    const { name, providerId, providerDescription, description, whoCanApply, whenToApply, applyLink, ageLimit, amountDetails } = req.body;
    const { id } = req.params;

    //  Check if all required fields are provided
    if (!(name && providerDescription && description && whoCanApply && whenToApply && applyLink && ageLimit && amountDetails)) {
        res.status(400).json({
            success: false,
            message: "Please provide all required fields",
            error: true
        });
        return;
    }

    // Check if scholarship already exists 
    const isExist = await prisma.scholarships.findFirst({ where: { id: parseInt(id) } });
    if (!isExist) {
        res.status(404).json({
            success: false,
            message: "Scholarship is not exists",
            error: true
        });
        return;
    }

    // Update scholarship
    const updatedScholarship = await prisma.scholarships.update({
        where: { id: parseInt(id) },
        data: {
            name,
            providerId: parseInt(providerId),
            providerDescription,
            description,
            whoCanApply,
            whenToApply,
            applyLink,
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
            applyLink: true,
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
});

export const deleteScholarship = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if scholarship already exists
    const isExist = await prisma.scholarships.findFirst({ where: { id: Number(id) } });

    if (!isExist) {
        res.status(404).json({
            success: false,
            message: "Scholarship is not exists",
            error: true
        });
        return;
    }

    // Delete scholarship
    await prisma.scholarships.delete({ where: { id: Number(id) } });

    res.status(200).json({
        message: "Scholarship deleted successfully",
        error: false,
        success: true
    });
});

// apply for scholarship controller functions - create, update, delete and get all applications

export const getAllScholarshipApplications = asyncHandler(async (req: Request, res: Response) => {
    const { limit, page, search, scholarshipId } = req.query; 
    const allApplications = await prisma.scholarshipApplication.findMany({
        take: Number(limit) || 10,
        skip: (Number(page) - 1) * Number(limit) || 0,
        where: {
            scholarshipId: {
                equals: parseInt(scholarshipId as string) || 0
            },
            name: {
                contains: (search as string) || "",
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
        totalPages: Math.ceil(allApplications.length / (Number(limit) || 10)),
        page: Number(page) || 1,
        limit: Number(limit) || 10
    });
});

export const applicantDetails = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const applicant = await prisma.scholarshipApplication.findFirst({
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
});

export const applyForScholarship = asyncHandler(async (req: Request, res: Response) => {
    const {
        name,
        scholarshipId,
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
        btechResults, // "1st sem: 8.5, 2nd sem: 8.5, 3rd sem: 8.5, 4th sem: 8.5, 5th sem: 8.5, 6th sem: 8.5, 7th sem: 8.5, 8th sem: 8.5"
        department,
        achievements,
        jobDetails,
    } = req.body;

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
    const isExist = await prisma.scholarships.findFirst({
        where: {
            scholarshipApplicants: {
                some: {
                    studentId: studentId
                }
            }
        }
    })

    if (isExist) {
        res.status(400).json({
            success: false,
            message: "You already applied for this scholarship",
            error: true
        });
        return;
    }

    // Create new scholarship application
    const newScholarshipApplication = await prisma.scholarshipApplication.create({
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
})

export const deleteApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.scholarshipApplication.delete({ where: { id: parseInt(id) } });
    res.status(200).json({
        message: "Application deleted successfully",
        error: false,
        success: true
    });
});