
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import prisma from "../prisma";
import { sendMail } from '../utils/mailer';
import { WelcomeMail } from '../utils/mail-templates';
import { uploadOnCloudinary } from '../utils/cloudinary';

interface FileType {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: string;
}

interface IResponse extends Response {
    files: {
        photo: FileType[],
        receipt: FileType[]
    }
}


export const registerMember = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, studentId, passingYear, department, residentialAddress, professionalAddress } = req.body;
    const { photo, receipt } = (req as unknown as IResponse).files;

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
    const isExist = await prisma.members.findFirst({ where: { email } });
    if (isExist) {
        res.status(409).json({
            message: "Member already exists",
            error: true,
            success: false
        })
        return;
    }

    // Hash password & save member to database
    const hashedPassword = await bcrypt.hash(password, 10);
    const photoUrl = await uploadOnCloudinary(photo[0].path);
    const receiptUrl = await uploadOnCloudinary(receipt[0].path);

    const newMember = await prisma.members.create({
        data: {
            name,
            email,
            password: hashedPassword,
            studentId,
            passingYear: parseInt(passingYear),
            department,
            residentialAddress,
            professionalAddress,
            photo: photoUrl?.url || "",
            photo_public_id: photoUrl?.public_id || "",
            receipt: receiptUrl?.url || "",
            receipt_public_id: receiptUrl?.public_id || "",
        }
    });

    // send email welcome
    await sendMail(email, "Welcome to JGEC Alumni Association", WelcomeMail(name));

    // generate token & cookies
    const accessToken = jwt.sign(
        { userId: newMember.id, email: newMember.email, name: newMember.name },
        process.env.JWT_SECRET as string,
        { expiresIn: '1D' }
    );

    const response = res.cookie(
        "token",
        accessToken,
        {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        }
    );

    response.status(201).json({
        message: "Member registered successfully",
        data: newMember,
        accessToken,
        error: false,
        success: true
    });
});

export const loginMember = asyncHandler(async (req: Request, res: Response) => {
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
    const member = await prisma.members.findFirst({ where: { email } });
    if (!member) {
        res.status(401).json({
            message: "Member not exists",
            error: true,
            success: false
        });
        return;
    }

    // Check if password is correct or not
    const isCorrectPass = bcrypt.compare(password, member.password);
    if (!isCorrectPass) {
        res.status(401).json({
            message: "Invalid credentials",
            error: true,
            success: false
        });
        return;
    }

    // generate token & cookies
    const accessToken = jwt.sign(
        { userId: member.id, email: member.email, name: member.name },
        process.env.JWT_SECRET as string,
        { expiresIn: '1D' }
    );

    const response = res.cookie(
        "token",
        accessToken,
        {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        }
    );

    response.status(200).json({
        message: "Login successful",
        data: member,
        accessToken,
        error: false,
        success: true
    });
})

export const memberDetails = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    // Check if member exists or not
    const member = await prisma.members.findFirst({ where: { id: parseInt(id) } });
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
})