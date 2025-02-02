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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authentication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // console.log(req.headers);
    const authHeader = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.cookie;
    if (!authHeader) {
        res.status(404).json({
            message: "Authorization header is missing",
            error: true,
            success: false
        });
        return;
    }
    const token = authHeader.split('token=')[1];
    // console.log(token);
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err) {
            res.status(404).json({
                message: "Invalid token or expired",
                error: true,
                success: false
            });
        }
        else {
            next();
        }
    });
});
exports.default = authentication;
