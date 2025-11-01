import prisma from "../prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import {
	generateContributionReceiptPDF,
	generateSingleContributionReceiptPDF,
} from "../utils/pdf";
import { sendMailWithAttachment, sendMail } from "../utils/mailer";
import { contributionReceiptMail } from "../utils/mail-templates";

import {
	uploadContriReceiptToCloudinary,
	uploadReceiptToCloudinary,
} from "../utils/cloudinary";

// Create a new contribution
export const createContribution = asyncHandler(
	async (req: Request, res: Response) => {
		// const { nameOfAluminus, graduationYear, amount, depositedOn, mobileNo } =
		// 	req.body;
		// // Validate required fields
		// if (
		// 	!(nameOfAluminus && graduationYear && amount && depositedOn && mobileNo)
		// ) {
		// 	res.status(400).json({
		// 		success: false,
		// 		message: "Please provide all required fields",
		// 		error: true,
		// 	});
		// 	return;
		// }
		// try {
		// 	const contribution = await prisma.contribution.create({
		// 		data: {
		// 			nameOfAluminus,
		// 			graduationYear: parseInt(graduationYear),
		// 			amount: parseFloat(amount),
		// 			depositedOn: depositedOn,
		// 			mobileNo,
		// 		},
		// 	});
		// 	if (!contribution) {
		// 		res.status(500).json({
		// 			success: false,
		// 			message: "Failed to create contribution",
		// 			error: true,
		// 		});
		// 		return;
		// 	}
		// 	res.status(201).json({
		// 		success: true,
		// 		message: "Contribution created successfully",
		// 		data: contribution,
		// 	});
		// } catch (error) {
		// 	console.error("Error creating contribution:", error);
		// 	res.status(500).json({
		// 		success: false,
		// 		message: "Internal server error",
		// 		error: true,
		// 	});
		// }
	}
);

// Get all contributions with pagination and search
export const getAllContributions = asyncHandler(
  async (req: Request, res: Response) => {
    const { search, limit, page, graduationYear } = req.query;

    try {
      const pageNum = Number(page) || 1;
      const pageSize = Number(limit) || 10;
      const skip = (pageNum - 1) * pageSize;

      // Build where safely
      const where: any = {};

      // Graduation year filter (AND)
      if (graduationYear !== undefined && String(graduationYear).trim() !== "" && !isNaN(Number(graduationYear))) {
        where.graduationYear = Number(graduationYear);
      }

      // Build OR for search only if search is non-empty
      if (search && typeof search === "string" && search.trim().length > 0) {
        const s = search.trim();

        const orArr: any[] = [];

        // nameOfAluminus & email are expected strings -> use contains (case-sensitive if Prisma does not support insensitive)
        orArr.push({ nameOfAluminus: { contains: s } });
        orArr.push({ email: { contains: s } });

        // mobileNo: if numeric search, include numeric equals; otherwise skip contains (not valid for numeric fields)
        const possibleNum = Number(s);
        if (!isNaN(possibleNum)) {
          orArr.push({ mobileNo: possibleNum });
        } else {
          // if mobileNo is stored as string in your DB (e.g. varchar), you can enable this:
          // orArr.push({ mobileNo: { contains: s } });
          // but only do that if mobileNo is actually a string column
        }

        // Attach OR only if any entry exists
        if (orArr.length > 0) where.OR = orArr;
      }

      // Debug log (optional) — remove in production
      console.log("Contributions where:", JSON.stringify(where));

      // Paginated data and count
      const [contributions, totalCount] = await Promise.all([
        prisma.contribution.findMany({
          where,
          skip,
          take: pageSize,
        }),
        prisma.contribution.count({ where }),
      ]);

      
      const statsWhere = where;
      const allContributions = await prisma.contribution.findMany({
        where: statsWhere,
        select: { amount: true, graduationYear: true, depositedOn: true },
      });

      const allYearsRaw = await prisma.contribution.findMany({
        distinct: ["graduationYear"],
        select: { graduationYear: true },
        orderBy: { graduationYear: "desc" },
      });

      const allGraduationYears = allYearsRaw
        .map((y) => y.graduationYear)
        .filter((y) => y !== null && !isNaN(Number(y)));

      const totalAmount = allContributions.reduce(
        (sum, c) => sum + (Number(c.amount) || 0),
        0
      );
      const uniqueBatches = new Set(allContributions.map((c) => c.graduationYear)).size;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyContributions = allContributions.filter((c) => {
        if (!c.depositedOn) return false;
        const date = new Date(c.depositedOn);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;

      res.status(200).json({
        success: true,
        error: false,
        message: "Contributions fetched successfully",
        data: contributions,
        docCount: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        page: pageNum,
        limit: pageSize,
        stats: {
          totalAmount,
          totalContributions: totalCount,
          uniqueBatches,
          monthlyContributions,
        },
        allGraduationYears,
      });
    } catch (error) {
      console.error("Error fetching contributions:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: true,
      });
    }
  }
);


// Get a single contribution by ID
export const getContributionById = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params;

		try {
			const contribution = await prisma.contribution.findFirst({
				where: { id: parseInt(id) },
			});

			if (!contribution) {
				res.status(404).json({
					success: false,
					message: "Contribution not found",
					error: true,
				});
				return;
			}

			res.status(200).json({
				success: true,
				message: "Contribution fetched successfully",
				data: contribution,
			});
		} catch (error) {
			console.error("Error fetching contribution:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
				error: true,
			});
		}
	}
);

// Update a contribution
export const updateContribution = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const { nameOfAluminus, graduationYear, amount, depositedOn, mobileNo } =
			req.body;

		try {
			const existingContribution = await prisma.contribution.findFirst({
				where: { id: parseInt(id) },
			});

			if (!existingContribution) {
				res.status(404).json({
					success: false,
					message: "Contribution not found",
					error: true,
				});
				return;
			}

			const updatedContribution = await prisma.contribution.update({
				where: { id: parseInt(id) },
				data: {
					nameOfAluminus: nameOfAluminus || existingContribution.nameOfAluminus,
					graduationYear: graduationYear
						? parseInt(graduationYear)
						: existingContribution.graduationYear,
					amount: amount ? parseFloat(amount) : existingContribution.amount,
					depositedOn: depositedOn || existingContribution.depositedOn,

					mobileNo: mobileNo || existingContribution.mobileNo,
				},
			});

			res.status(200).json({
				success: true,
				message: "Contribution updated successfully",
				data: updatedContribution,
			});
		} catch (error) {
			console.error("Error updating contribution:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
				error: true,
			});
		}
	}
);

// Delete a contribution
export const deleteContribution = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params;

		try {
			const contribution = await prisma.contribution.findFirst({
				where: { id: parseInt(id) },
			});

			if (!contribution) {
				res.status(404).json({
					success: false,
					message: "Contribution not found",
					error: true,
				});
				return;
			}

			await prisma.contribution.delete({
				where: { id: parseInt(id) },
			});

			res.status(200).json({
				success: true,
				message: "Contribution deleted successfully",
			});
		} catch (error) {
			console.error("Error deleting contribution:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
				error: true,
			});
		}
	}
);

// Send individual contribution receipt via email
export const sendContributionReceipt = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const { email } = req.body;

		if (!email) {
			res.status(400).json({
				success: false,
				message: "Email address is required",
				error: true,
			});
			return;
		}

		try {
			const contribution = await prisma.contribution.findFirst({
				where: { id: parseInt(id) },
			});

			if (!contribution) {
				res.status(404).json({
					success: false,
					message: "Contribution not found",
					error: true,
				});
				return;
			}

			// Generate receipt PDF
			const receiptPdf = await generateContributionReceiptPDF(contribution);

			// Send email with receipt
			await sendMailWithAttachment(
				email,
				"Alumni Contribution Receipt",
				contributionReceiptMail(
					contribution.nameOfAluminus,
					contribution.amount,
					contribution.graduationYear
				),
				receiptPdf,
				`contribution_receipt_${contribution.nameOfAluminus.replace(
					/\s+/g,
					"_"
				)}`
			);

			res.status(200).json({
				success: true,
				message: "Contribution receipt sent successfully",
			});
		} catch (error) {
			console.error("Error sending contribution receipt:", error);
			res.status(500).json({
				success: false,
				message: "Internal server error",
				error: true,
			});
		}
	}
);

// Bulk create contributions from Excel/CSV data

export const bulkCreateContributions = asyncHandler(
	async (req: Request, res: Response) => {
		const contributions = req.body;

		if (!Array.isArray(contributions) || contributions.length === 0) {
			res.status(400).json({
				success: false,
				message: "Please provide contributions array",
				error: true,
			});
			return;
		}

		try {
			// 1️⃣ Skip duplicates based on slNo
			const slNos = contributions.map((c: any) => parseInt(c.SlNo));
			const existing = await prisma.contribution.findMany({
				where: { slNo: { in: slNos } },
				select: { slNo: true },
			});
			const existingIds = new Set(existing.map((e) => e.slNo));

			const newContributions = contributions.filter(
				(c: any) => !existingIds.has(parseInt(c.SlNo))
			);

			if (newContributions.length === 0) {
				res.status(200).json({
					success: true,
					message: "All contributions already exist. No new entries added.",
					data: { count: 0 },
				});
				return;
			}

			const formatted = newContributions.map((c: any) => ({
				slNo: parseInt(c.SlNo),
				nameOfAluminus: c.NameOfAlumnus,
				graduationYear: parseInt(c.GraduationYear) || 0,
				amount: parseFloat(c.AmountINR),
				depositedOn: c.DepositedOn,
				mobileNo: c.MobileNo?.toString(),
				email: c.Email || null,
			}));

			const created = await prisma.$transaction(
				formatted.map((data) => prisma.contribution.create({ data }))
			);

			const updatedRecords = [];
			for (const contrib of created) {
				try {
					// generate individual receipt PDF (as Buffer)
					const pdfBuffer = await generateContributionReceiptPDF(contrib);

					// upload to Cloudinary
					const uploaded = await uploadContriReceiptToCloudinary(
						pdfBuffer,
						contrib.nameOfAluminus
					);

					// update that record with Cloudinary info
					const updated = await prisma.contribution.update({
						where: { id: contrib.id },
						data: {
							pdfLink: uploaded.secure_url,
							pdfLink_public_id: uploaded.public_id,
						},
					});

					updatedRecords.push(updated);
				} catch (err) {
					console.error(`Error processing SL No ${contrib.slNo}:`, err);
				}
			}

			res.status(201).json({
				success: true,
				message: `${updatedRecords.length} contributions created successfully with individual PDF receipts.`,
				data: {
					count: updatedRecords.length,
					contributions: updatedRecords.map((r) => ({
						slNo: r.slNo,
						name: r.nameOfAluminus,
						pdf: r.pdfLink,
					})),
				},
			});
		} catch (error) {
			console.error("Error bulk creating contributions:", error);
			res.status(500).json({
				success: false,
				message:
					error instanceof Error ? error.message : "Internal server error",
				error: true,
			});
		}
	}
);
