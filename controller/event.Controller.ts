import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import prisma from "../prisma";

export const addNewEvent = asyncHandler(async (req: Request, res: Response) => {
	const {
		name,
		shortDescription,
		details,
		event_thumbnail,
		date,
		time,
		location,
		hostName,
		hostDetails,
		schedule,
	} = req.body;

	if (
		!(
			name &&
			shortDescription &&
			details &&
			event_thumbnail &&
			date &&
			time &&
			location &&
			hostName &&
			hostDetails
		)
	) {
		res.status(400).json({
			success: false,
			message: "Please provide all required fields",
			error: true,
		});
		return;
	}

	//Create new event
	const newEvent = await prisma.event.create({
		data: {
			name,
			shortDescription,
			details,
			event_thumbnail,
			date,
			time,
			location,
			hostName,
			hostDetails,
		},
		select: {
			id: true,
			name: true,
			shortDescription: true,
			details: true,
			event_thumbnail: true,
			date: true,
			time: true,
			location: true,
			hostName: true,
			hostDetails: true,
		},
	});
	for (const scheduleItem of schedule) {
		const newSchedule = await prisma.eventSchedule.create({
			data: {
				eventId: newEvent.id,
				startTime: scheduleItem.startTime,
				endTime: scheduleItem.endTime,
				activity: scheduleItem.activity,
			},
			select: {
				id: true,
				startTime: true,
				endTime: true,
				activity: true,
				eventId: true,
				Event: {
					select: {
						id: true,
						name: true,
						shortDescription: true,
						details: true,
						event_thumbnail: true,
						date: true,
						time: true,
						location: true,
						hostName: true,
						hostDetails: true,
					},
				},
			},
		});
	}
	res.status(201).json({
		message: "Event added successfully",
		data: newEvent,
		error: false,
		success: true,
	});
});

export const getAllEvents = asyncHandler(
	async (req: Request, res: Response) => {
		const { limit, page, search } = req.query;

		const count = await prisma.event.count();
		const scholarships = await prisma.event.findMany({
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
				shortDescription: true,
				details: true,
				event_thumbnail: true,
				date: true,
				time: true,
				location: true,
				hostName: true,
				hostDetails: true,
				schedule: {
					select: {
						id: true,
						startTime: true,
						endTime: true,
						activity: true,
					},
				},
			},
		});

		res.status(200).json({
			message: "Events fetched successfully",
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

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
	const {
		name,
		shortDescription,
		details,
		event_thumbnail,
		date,
		time,
		location,
		hostName,
		hostDetails,
		schedule,
	} = req.body;

	const { id } = req.params;

	if (
		!(
			name &&
			shortDescription &&
			details &&
			event_thumbnail &&
			date &&
			time &&
			location &&
			hostName &&
			hostDetails
		)
	) {
		res.status(400).json({
			success: false,
			message: "Please provide all required fields",
			error: true,
		});
		return;
	}

	const isExist = await prisma.event.findFirst({ where: { id: parseInt(id) } });
	if (!isExist) {
		res
			.status(404)
			.json({ success: false, message: "Event not found", error: true });
		return;
	}

	const updateEvent = await prisma.event.update({
		where: { id: parseInt(id) },
		data: {
			name,
			shortDescription,
			details,
			event_thumbnail,
			date,
			time,
			location,
			hostName,
			hostDetails,
		},
	});

	for (const scheduleItem of schedule) {
		await prisma.eventSchedule.upsert({
			where: {
				id: parseInt(scheduleItem.id) || 0,
			},
			update: {
				startTime: scheduleItem.startTime,
				endTime: scheduleItem.endTime,
				activity: scheduleItem.activity,
			},
			create: {
				eventId: parseInt(id),
				startTime: scheduleItem.startTime,
				endTime: scheduleItem.endTime,
				activity: scheduleItem.activity,
			},
		});
	}
	const eventWithSchedule = await prisma.event.findUnique({
		where: { id: parseInt(id) },
		select: {
			id: true,
			name: true,
			shortDescription: true,
			details: true,
			event_thumbnail: true,
			date: true,
			time: true,
			location: true,
			hostName: true,
			hostDetails: true,
			schedule: {
				select: {
					id: true,
					startTime: true,
					endTime: true,
					activity: true,
				},
			},
		},
	});
	res.status(201).json({
		message: "Event updated successfully",
		data: eventWithSchedule,
		error: false,
		success: true,
	});
});
