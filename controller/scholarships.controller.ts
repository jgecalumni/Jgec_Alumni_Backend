import { Request, Response } from "express";
import prisma from "../prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";

// all scholarships controller functions - create, update, delete and get all scholarships
export const getAllScholarshipsAdmin = asyncHandler(
	async (req: Request, res: Response) => {
		const { limit, page, search } = req.query;

		const count = await prisma.scholarships.count();
		const scholarships = await prisma.scholarships.findMany({
			take: Number(limit) || 10,
			skip: (Number(page) - 1) * Number(limit) || 0,
			// search name if search keyword exist
			where: {
				name: {
					contains: (search as string) || "",
				},
			},
			select: {
				id: true,
				name: true,
				subtitle: true,
				providerName: true,
				providerDepartment: true,
				providerPassingYear: true,
				providerImage: true,
				providerDescription: true,
				description: true,
				whoCanApply: true,
				whenToApply: true,
				ageLimit: true,
				amountDetails: true,
				semRequire: true,
				isActive: true,
				department: true,
				scholarshipApplicants: {
					select: {
						id: true,
						name: true,
						email: true,
						mobile: true,
						department: true,
						hsPercentage: true,
						btechResults: true,
					},
				},
			},
		});

		res.status(200).json({
			message: "Scholarships fetched successfully",
			scholarships,
			error: false,
			success: true,
			docCount: count,
			totalPages: Math.ceil(count / (Number(limit) || 10)),
			page: Number(page) || 1,
			limit: Number(limit) || 10,
		});
	}
);
export const getAllScholarships = asyncHandler(
	async (req: Request, res: Response) => {
		const { search, limit, page } = req.query;

		const count = await prisma.scholarships.count();
		const scholarships = await prisma.scholarships.findMany({
			// search name if search keyword exist
			where: {
				name: {
					contains: (search as string) || "",
				},
			},
			select: {
				id: true,
				name: true,
				subtitle: true,
				providerName: true,
				providerDepartment: true,
				providerPassingYear: true,
				providerImage: true,
				providerDescription: true,
				description: true,
				whoCanApply: true,
				whenToApply: true,
				ageLimit: true,
				amountDetails: true,
				semRequire: true,
				isActive: true,
				department: true,
				scholarshipApplicants: {
					select: {
						id: true,
						name: true,
						email: true,
						mobile: true,
						department: true,
						hsPercentage: true,
						btechResults: true,
					},
				},
			},
		});

		res.status(200).json({
			message: "Scholarships fetched successfully",
			scholarships,
			error: false,
			success: true,
			docCount: count,
			totalPages: Math.ceil(count / (Number(limit) || 10)),
			page: Number(page) || 1,
			limit: Number(limit) || 10,
		});
	}
);

export const getScholarshipById = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params;

		// Fetch scholarship details by scholarshipId
		const scholarship = await prisma.scholarships.findUnique({
			where: {
				id: Number(id),
			},
			select: {
				id: true,
				name: true,
				subtitle: true,
				providerName: true,
				providerDepartment: true,
				providerPassingYear: true,
				providerImage: true,
				providerDescription: true,
				description: true,
				whoCanApply: true,
				whenToApply: true,
				ageLimit: true,
				amountDetails: true,
				semRequire: true,
				isActive: true,
				department: true,
				scholarshipApplicants: {
					select: {
						id: true,
						name: true,
						email: true,
						mobile: true,
						department: true,
						hsPercentage: true,
						btechResults: true,
					},
				},
			},
		});

		// If no scholarship is found
		if (!scholarship) {
			res.status(404).json({
				success: false,
				message: "Scholarship not found",
				error: true,
			});
			return;
		}

		res.status(200).json({
			message: "Scholarship fetched successfully",
			data: scholarship,
			error: false,
			success: true,
		});
	}
);

export const addNewScholarship = asyncHandler(
	async (req: Request, res: Response) => {
		const {
			name,
			subtitle,
			providerName,
			providerDepartment,
			providerPassingYear,
			providerDescription,
			description,
			whoCanApply,
			whenToApply,
			ageLimit,
			amountDetails,
			semRequire,
			isActive,
			department,
		} = req.body;
		const providerImage = (req as any).file;
		if (
			!(
				name &&
				subtitle &&
				providerName &&
				providerDepartment &&
				providerPassingYear &&
				providerDescription &&
				description &&
				whoCanApply &&
				whenToApply &&
				ageLimit &&
				amountDetails &&
				semRequire &&
				department
			)
		) {
			res.status(400).json({
				success: false,
				message: "Please provide all required fields",
				error: true,
			});
			return;
		}

		// Check if scholarship already exists
		const updateName = String(name).toLowerCase().trim();
		const isExist = await prisma.scholarships.findFirst({
			where: { name: updateName },
		});

		if (isExist) {
			res.status(400).json({
				success: false,
				message: "Scholarship already exists",
				error: true,
			});
			return;
		}

		const fileLink = await uploadOnCloudinary(providerImage.path);

		// Create new scholarship
		const newScholarship = await prisma.scholarships.create({
			data: {
				name,
				subtitle,
				providerName,
				providerDepartment,
				providerPassingYear: parseInt(providerPassingYear),
				providerImage: fileLink?.url || "",
				providerImage_public_id: fileLink?.public_id || "",
				providerDescription,
				description,
				whoCanApply,
				whenToApply,
				ageLimit,
				amountDetails,
				semRequire,
				isActive:isActive==="Yes"?true:false,
				department,
			},
			select: {
				id: true,
				name: true,
				subtitle: true,
				providerName: true,
				providerDepartment: true,
				providerPassingYear: true,
				providerImage: true,
				providerImage_public_id: true,
				providerDescription: true,
				description: true,
				whoCanApply: true,
				whenToApply: true,
				ageLimit: true,
				amountDetails: true,
				semRequire: true,
				isActive: true,
				department: true,
			},
		});

		res.status(201).json({
			message: "Scholarship added successfully",
			data: newScholarship,
			error: false,
			success: true,
		});
	}
);

export const updateScholarship = asyncHandler(
	async (req: Request, res: Response) => {
		const {
			name,
			subtitle,
			providerName,
			providerDepartment,
			providerPassingYear,
			providerDescription,
			description,
			whoCanApply,
			whenToApply,
			ageLimit,
			amountDetails,
			semRequire,
			isActive,
			department,
		} = req.body;
		
		const providerImage = (req as any).file;
		const { id } = req.params;

		//  Check if all required fields are provided
		if (
			!(
				name &&
				subtitle &&
				providerName &&
				providerDescription &&
				providerDepartment &&
				providerPassingYear &&
				description &&
				whoCanApply &&
				whenToApply &&
				ageLimit &&
				amountDetails &&
				semRequire && department
			)
		) {
			res.status(400).json({
				success: false,
				message: "Please provide all required fields",
				error: true,
			});
			return;
		}

		// Check if scholarship already exists
		const isExist = await prisma.scholarships.findFirst({
			where: { id: parseInt(id) },
		});
		if (!isExist) {
			res.status(404).json({
				success: false,
				message: "Scholarship is not exists",
				error: true,
			});
			return;
		}
		let fileLinkExist = isExist.providerImage || "";
		let fileLinkExistId = isExist.providerImage_public_id || "";
		let fileLink = null;

		if (providerImage) {
			if (isExist.providerImage_public_id) {
				await deleteFromCloudinary(isExist.providerImage_public_id);
			}
			fileLink = await uploadOnCloudinary(providerImage.path);
		}

		// Update scholarship
		const updatedScholarship = await prisma.scholarships.update({
			where: { id: parseInt(id) },
			data: {
				name,
				subtitle,
				providerName,
				providerDepartment,
				providerPassingYear: parseInt(providerPassingYear),
				providerImage: fileLink?.url || fileLinkExist,
				providerImage_public_id: fileLink?.public_id || fileLinkExistId,
				providerDescription,
				description,
				whoCanApply,
				whenToApply,
				ageLimit,
				amountDetails,
				semRequire,
				isActive:isActive==="Yes"||"true"?true:false,
				department,
			},
			select: {
				id: true,
				name: true,
				subtitle: true,
				providerName: true,
				providerDepartment: true,
				providerPassingYear: true,
				providerImage: true,
				providerImage_public_id: true,
				providerDescription: true,
				description: true,
				whoCanApply: true,
				whenToApply: true,
				ageLimit: true,
				amountDetails: true,
				semRequire: true,
				isActive: true,
				department: true,
			},
		});

		res.status(201).json({
			message: "Scholarship updated successfully",
			data: updatedScholarship,
			error: false,
			success: true,
		});
	}
);

export const deleteScholarship = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params;

		// Check if scholarship already exists
		const isExist = await prisma.scholarships.findFirst({
			where: { id: Number(id) },
		});

		if (!isExist) {
			res.status(404).json({
				success: false,
				message: "Scholarship is not exists",
				error: true,
			});
			return;
		}

		// Delete scholarship
		await prisma.scholarships.delete({ where: { id: Number(id) } });
		const deleteThumbnail = await deleteFromCloudinary(
			isExist.providerImage_public_id || ""
		);

		res.status(200).json({
			message: "Scholarship deleted successfully",
			error: false,
			success: true,
		});
	}
);

// apply for scholarship controller functions - create, update, delete and get all applications

export const getAllScholarshipApplications = asyncHandler(
	async (req: Request, res: Response) => {
		const { limit, page, search, scholarshipId } = req.query;
		const totalCount = await prisma.scholarshipApplication.count();
		const allApplications = await prisma.scholarshipApplication.findMany({
			take: Number(limit) || 10,
			skip: (Number(page) - 1) * Number(limit) || 0,
			where: {
				scholarshipId: {
					equals: parseInt(scholarshipId as string) || 0,
				},
				name: {
					contains: (search as string) || "",
				},
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
						providerName: true,
						providerImage: true,
						providerDescription: true,
					},
				},
			},
		});

		res.status(200).json({
			message: "Scholarship applications fetched successfully",
			data: allApplications,
			error: false,
			success: true,
			docCount: allApplications.length,
			totalPages: Math.ceil(totalCount / (Number(limit) || 10)),
			page: Number(page) || 1,
			limit: Number(limit) || 10,
		});
	}
);

export const applicantDetails = asyncHandler(
	async (req: Request, res: Response) => {
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
						providerName: true,
						providerImage: true,
						providerDescription: true,
					},
				},
			},
		});

		if (!applicant) {
			res.status(404).json({
				success: false,
				message: "Applicant details not found",
				error: true,
			});
			return;
		}

		res.status(200).json({
			message: "Applicant details fetched successfully",
			data: applicant,
			error: false,
			success: true,
		});
	}
);

export const applyForScholarship = asyncHandler(
	async (req: Request, res: Response) => {
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
		if (
			!(
				name &&
				scholarshipId &&
				studentId &&
				dob &&
				email &&
				mobile &&
				fatherOccupation &&
				noOfFamilyMembers &&
				familyIncome &&
				earningPerMember &&
				collegeIntakeYear &&
				address &&
				hsPercentage &&
				btechResults &&
				department
			)
		) {
			res.status(400).json({
				success: false,
				message: "Please provide all required fields",
				error: true,
			});
			return;
		}

		// Check if user already applied for scholarship
		const isExist = await prisma.scholarships.findFirst({
			where: {
				scholarshipApplicants: {
					some: {
						studentId: studentId,
					},
				},
			},
		});

		if (isExist) {
			res.status(400).json({
				success: false,
				message: "You already applied for this scholarship",
				error: true,
			});
			return;
		}

		// Create new scholarship application
		const newScholarshipApplication =
			await prisma.scholarshipApplication.create({
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
					jobDetails,
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
							providerName: true,
							providerImage: true,
							providerDescription: true,
						},
					},
				},
			});

		res.status(201).json({
			message: "Scholarship applied successfully",
			data: newScholarshipApplication,
			error: false,
			success: true,
		});
	}
);

export const deleteApplication = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params;
		await prisma.scholarshipApplication.delete({ where: { id: parseInt(id) } });
		res.status(200).json({
			message: "Application deleted successfully",
			error: false,
			success: true,
		});
	}
);
