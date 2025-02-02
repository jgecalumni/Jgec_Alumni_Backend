"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFile = void 0;
const validateFile = (req, res, next) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const maxSize = 1 * 1024 * 1024; // 1MB
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
exports.validateFile = validateFile;
