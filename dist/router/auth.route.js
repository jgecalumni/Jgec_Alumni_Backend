"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controller/auth.controller");
const photo_upload_1 = require("../middleware/photo-upload");
const authentication_1 = __importDefault(require("../middleware/authentication"));
const router = express_1.default.Router();
router.route("/register").post(photo_upload_1.upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "receipt", maxCount: 1 },
]), auth_controller_1.registerMember);
router.route('/admin/login').post(auth_controller_1.adminLogin);
router.route("/login").post(auth_controller_1.loginMember);
router.route('/logout').get(auth_controller_1.logout);
router.route('/').get(authentication_1.default, auth_controller_1.allMembers);
router.route("/profile/:id").get(authentication_1.default, auth_controller_1.memberDetails);
exports.default = router;
