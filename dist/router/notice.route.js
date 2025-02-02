"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notice_controller_1 = require("../controller/notice.controller");
const authentication_1 = __importDefault(require("../middleware/authentication"));
const photo_upload_1 = require("../middleware/photo-upload");
const router = express_1.default.Router();
router.route('/').get(notice_controller_1.getAllNotices);
router.route('/:id').get(notice_controller_1.noticeDetails);
router.route('/add').post(authentication_1.default, photo_upload_1.upload.single('file'), notice_controller_1.createNewNotice);
router.route('/update/:id').patch(authentication_1.default, photo_upload_1.upload.single('file'), notice_controller_1.updateNoticeDetails);
router.route('/delete/:id').delete(authentication_1.default, notice_controller_1.deleteNotice);
exports.default = router;
