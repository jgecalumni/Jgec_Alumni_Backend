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
exports.memberDetails = exports.allMembers = exports.logout = exports.loginMember = exports.registerMember = exports.adminLogin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const asyncHandler_1 = require("../utils/asyncHandler");
const prisma_1 = __importDefault(require("../prisma"));
const mailer_1 = require("../utils/mailer");
const mail_templates_1 = require("../utils/mail-templates");
const cloudinary_1 = require("../utils/cloudinary");
exports.adminLogin = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!(email && password)) {
        res.status(400).json({
            message: "Email and password are required",
            error: true,
            success: false
        });
        return;
    }
    const checkEmail = email === process.env.ADMIN_EMAIL;
    const checkPassword = password === process.env.ADMIN_PASSWORD;
    if (!checkEmail) {
        res.status(401).json({
            message: "Admin not exists",
            error: true,
            success: false
        });
        return;
    }
    if (!checkPassword) {
        res.status(401).json({
            message: "Invalid credentials",
            error: true,
            success: false
        });
        return;
    }
    // generate token & cookies
    const accessToken = jsonwebtoken_1.default.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1D' });
    const response = res.cookie("token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });
    response.status(200).json({
        message: "Login successful",
        accessToken,
        error: false,
        success: true
    });
}));
exports.registerMember = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, studentId, passingYear, department, residentialAddress, professionalAddress } = req.body;
    const { photo, receipt } = req.files;
    // Check if all fields are provided
    if (!(name && email && password && studentId && passingYear && department && residentialAddress && professionalAddress && photo && receipt)) {
        res.status(400).json({
            message: "All fields are required",
            error: true,
            success: false
        });
        return;
    }
    // Check if member already exists or not
    const isExist = yield prisma_1.default.members.findFirst({ where: { email } });
    if (isExist) {
        res.status(409).json({
            message: "Member already exists",
            error: true,
            success: false
        });
        return;
    }
    // Hash password & save member to database
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const photoUrl = yield (0, cloudinary_1.uploadOnCloudinary)(photo[0].path);
    const receiptUrl = yield (0, cloudinary_1.uploadOnCloudinary)(receipt[0].path);
    const newMember = yield prisma_1.default.members.create({
        data: {
            name,
            email,
            password: hashedPassword,
            studentId,
            passingYear: parseInt(passingYear),
            department,
            residentialAddress,
            professionalAddress,
            photo: (photoUrl === null || photoUrl === void 0 ? void 0 : photoUrl.url) || "",
            photo_public_id: (photoUrl === null || photoUrl === void 0 ? void 0 : photoUrl.public_id) || "",
            receipt: (receiptUrl === null || receiptUrl === void 0 ? void 0 : receiptUrl.url) || "",
            receipt_public_id: (receiptUrl === null || receiptUrl === void 0 ? void 0 : receiptUrl.public_id) || "",
        }
    });
    // send email welcome
    yield (0, mailer_1.sendMail)(email, "Welcome to JGEC Alumni Association", (0, mail_templates_1.WelcomeMail)(name));
    // generate token & cookies
    const accessToken = jsonwebtoken_1.default.sign({ userId: newMember.id, email: newMember.email, name: newMember.name }, process.env.JWT_SECRET, { expiresIn: '1D' });
    const response = res.cookie("token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });
    response.status(201).json({
        message: "Member registered successfully",
        data: newMember,
        accessToken,
        error: false,
        success: true
    });
}));
exports.loginMember = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!(email && password)) {
        res.status(400).json({
            message: "All fields are required",
            error: true,
            success: false
        });
        return;
    }
    // Check if member exists or not
    const member = yield prisma_1.default.members.findFirst({ where: { email } });
    if (!member) {
        res.status(401).json({
            message: "Member not exists",
            error: true,
            success: false
        });
        return;
    }
    // Check if password is correct or not
    const isCorrectPass = bcrypt_1.default.compare(password, member.password);
    if (!isCorrectPass) {
        res.status(401).json({
            message: "Invalid credentials",
            error: true,
            success: false
        });
        return;
    }
    // generate token & cookies
    const accessToken = jsonwebtoken_1.default.sign({ userId: member.id, email: member.email, name: member.name }, process.env.JWT_SECRET, { expiresIn: '1D' });
    const response = res.cookie("token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });
    response.status(200).json({
        message: "Login successful",
        data: member,
        accessToken,
        error: false,
        success: true
    });
}));
exports.logout = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token");
    res.status(200).json({
        message: "Logout successful",
        error: false,
        success: true
    });
}));
exports.allMembers = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, search } = req.query;
    const lmt = limit ? Number(limit) : 10;
    const pg = page ? Number(page) : 1;
    const totalCount = yield prisma_1.default.members.count();
    const members = yield prisma_1.default.members.findMany({
        skip: (pg - 1) * lmt,
        take: lmt,
        where: {
            OR: [
                {
                    name: {
                        contains: search || ""
                    }
                },
                {
                    email: {
                        contains: search || ""
                    }
                },
            ]
        }
    });
    res.status(200).json({
        message: "All members fetched successfully",
        members,
        error: false,
        success: true,
        limit: lmt,
        page: pg,
        totalPages: Math.ceil(totalCount / lmt),
        docCount: totalCount
    });
}));
exports.memberDetails = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Check if member exists or not
    const member = yield prisma_1.default.members.findFirst({ where: { id: parseInt(id) } });
    if (!member) {
        res.status(404).json({
            message: "Member not exists",
            error: true,
            success: false
        });
        return;
    }
    res.status(200).json({
        data: member,
        error: false,
        success: true
    });
}));
