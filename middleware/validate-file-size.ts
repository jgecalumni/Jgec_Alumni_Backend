
import { Request, Response, NextFunction } from "express";

interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
}

interface IResponse {
    file: MulterFile;
}

export const validateFile = (req: IResponse, res: Response, next: NextFunction): void => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const maxSize = 2 * 1024 * 1024; // 1MB

    if (req.file && !allowedTypes.includes(req.file.mimetype)) {
        res.status(400).json({ success: false, message: "Invalid file type" });
        return;
    }

    if (req.file && req.file.size > maxSize) {
        res.status(400).json({ success: false, message: "File size exceeds 2MB" });
        return;
    }

    next();
};
