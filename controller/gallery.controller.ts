import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../prisma";

//gallery category

export const createCategory = asyncHandler(
	async (req: Request, res: Response) => {
		const { name } = req.body;
		if (!name) {
			res.status(400).json({ error: "Name is required" });
			return;
		}
		const isExist = await prisma.galleryCategory.findFirst({
			where: {
				name: name,
			},
		});
		if (isExist) {
			res.status(400).json({ error: "Category already exists" });
			return;
		}
		const category = await prisma.galleryCategory.create({
			data: {
				name: name,
			},
		});
		res.status(201).json({
			success: true,
			data: category,
			message: "Category added successfully",
			error: false,
		});
	}
);

export const upadateCategory = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const { name } = req.body;
		if (!name) {
			res.status(400).json({ error: "Name is required" });
			return;
		}
		const isExist = await prisma.galleryCategory.findFirst({
			where: {
				name: name,
			},
		});
		if (!isExist) {
			res.status(400).json({ error: "Category do not exists" });
			return;
		}
		const category = await prisma.galleryCategory.update({
			where: {
				id: parseInt(id),
			},
			data: {
				name: name,
			},
			select: {
				id: true,
				name: true,
				images: {
					select: {
						id: true,
						image: true,
					},
				},
			},
		});
		res.status(201).json({
			success: true,
			data: category,
			message: "Category updated successfully",
			error: false,
		});
	}
);

export const getAllCategory = asyncHandler(
	async (req: Request, res: Response) => {
		const category = await prisma.galleryCategory.findMany({
			select: {
				id: true,
				name: true,
				images: {
					select: {
						id: true,
						image: true,
					},
				},
			},
		});
		res.status(201).json({
			success: true,
			data: category,
			message: "Category fetched successfully",
			error: false,
		});
	}
);

export const deleteCategory = asyncHandler(
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const isExist = await prisma.galleryCategory.findFirst({
			where: {
				id: parseInt(id),
			},
		});
		if (!isExist) {
			res.status(400).json({ error: "Category do not exists" });
			return;
		}
		const category = await prisma.galleryCategory.delete({
			where: {
				id: parseInt(id),
			},
		});
		res.status(201).json({
			success: true,
			data: category,
			message: "Category deleted successfully",
			error: false,
		});
	}
);

// gallery images

export const createGalleryImage = asyncHandler(
	async (req: Request, res: Response) => {
		const { name, description, image } = req.body;
		const category = await prisma.galleryCategory.findFirst({
			where: {
				id: parseInt(req.params.id),
			},
		});
		if (!category) {
			res.status(400).json({ error: "Category do not exists" });
			return;
		}
		const galleryImage = await prisma.galleryImages.create({
			data: {
                galleryCategoryId:parseInt(req.params.id),
				image,
                				
			},
		});
		res.status(201).json({
			success: true,
			data: galleryImage,
			message: "Gallery image created successfully",
			error: false,
		});
	}
);
