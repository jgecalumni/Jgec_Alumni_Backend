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
exports.deleteNotice = exports.updateNoticeDetails = exports.createNewNotice = exports.noticeDetails = exports.getAllNotices = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const prisma_1 = __importDefault(require("../prisma"));
const cloudinary_1 = require("../utils/cloudinary");
exports.getAllNotices = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let limit = Number(req.query.limit) || 10;
    let page = Number(req.query.page) || 0;
    const notices = yield prisma_1.default.notice.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        skip: page * limit,
        take: limit
    });
    res.status(200).json({
        success: true,
        notices,
        message: "All notices fetched successfully",
        error: false,
        limit,
        page,
        totalPages: Math.ceil((yield prisma_1.default.notice.count()) / limit),
        totalCount: yield prisma_1.default.notice.count()
    });
}));
exports.noticeDetails = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({
            success: false,
            message: "Notice id is required",
            error: true
        });
        return;
    }
    const notice = yield prisma_1.default.notice.findUnique({
        where: {
            id: parseInt(id)
        }
    });
    if (!notice) {
        res.status(404).json({
            success: false,
            message: "Notice not found",
            error: true
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: notice,
        message: "Notice fetched successfully",
        error: false
    });
}));
exports.createNewNotice = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, date } = req.body;
    const file = req.file;
    if (!(title && description && date)) {
        res.status(400).json({
            success: false,
            message: "All fields are required",
            error: true
        });
        return;
    }
    // check file size less than 2MB or not
    if (file && file.size > 2 * 1024 * 1024) {
        res.status(400).json({
            success: false,
            message: "File size must be less than 2MB",
            error: true
        });
        return;
    }
    const isExists = yield prisma_1.default.notice.findFirst({ where: { title } });
    if (isExists) {
        res.status(400).json({
            success: false,
            message: "Notice with this title already exists",
            error: true
        });
        return;
    }
    // upload file to cloudinary and get link, delete previous link if exists
    let fileLink = null;
    if (file) {
        fileLink = yield (0, cloudinary_1.uploadOnCloudinary)(file.path);
    }
    const notice = yield prisma_1.default.notice.create({
        data: {
            title,
            description,
            date,
            link: (fileLink === null || fileLink === void 0 ? void 0 : fileLink.url) || "",
            link_public_id: (fileLink === null || fileLink === void 0 ? void 0 : fileLink.public_id) || ""
        }
    });
    res.status(201).json({
        success: true,
        data: notice,
        message: "Notice created successfully",
        error: false
    });
}));
exports.updateNoticeDetails = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, description, date } = req.body;
    const file = req.file;
    if (!id) {
        res.status(400).json({
            success: false,
            message: "Notice id is required",
            error: true
        });
        return;
    }
    if (!(title && description && date)) {
        res.status(400).json({
            success: false,
            message: "All fields are required",
            error: true
        });
        return;
    }
    // check file size less than 2MB or not
    if (file && file.size > 2 * 1024 * 1024) {
        res.status(400).json({
            success: false,
            message: "File size must be less than 2MB",
            error: true
        });
        return;
    }
    const notice = yield prisma_1.default.notice.findUnique({
        where: {
            id: parseInt(id)
        }
    });
    if (!notice) {
        res.status(404).json({
            success: false,
            message: "Notice not found",
            error: true
        });
        return;
    }
    // delete previous file from cloudinary if exists and upload new file
    let fileLink = null;
    if (file) {
        if (notice.link_public_id) {
            yield (0, cloudinary_1.deleteFromCloudinary)(notice.link_public_id);
        }
        fileLink = yield (0, cloudinary_1.uploadOnCloudinary)(file.path);
    }
    const updatedNotice = yield prisma_1.default.notice.update({
        where: {
            id: parseInt(id)
        },
        data: {
            title,
            description,
            date,
            link: (fileLink === null || fileLink === void 0 ? void 0 : fileLink.url) || notice.link,
            link_public_id: (fileLink === null || fileLink === void 0 ? void 0 : fileLink.public_id) || notice.link_public_id
        }
    });
    res.status(200).json({
        success: true,
        data: updatedNotice,
        message: "Notice updated successfully",
        error: false
    });
}));
exports.deleteNotice = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, link_id } = req.params;
    if (!id) {
        res.status(400).json({
            success: false,
            message: "Notice id is required",
            error: true
        });
        return;
    }
    // delete file from cloudinary if exists
    if (link_id) {
        yield (0, cloudinary_1.deleteFromCloudinary)(link_id);
    }
    yield prisma_1.default.notice.delete({
        where: {
            id: parseInt(id)
        }
    });
    res.status(200).json({
        success: true,
        message: "Notice deleted successfully",
        error: false
    });
}));
