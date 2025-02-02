import express from "express";
import {
    adminLogin,
    allMembers,
    loginMember,
    logout,
    memberDetails,
    registerMember,
} from "../controller/auth.controller";
import { upload } from "../middleware/photo-upload";
import authentication from "../middleware/authentication";

const router = express.Router();

router.route("/register").post(
    upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "receipt", maxCount: 1 },
    ]),
    registerMember
);
router.route('/admin/login').post(adminLogin);
router.route("/login").post(loginMember);
router.route('/logout').get(logout);
router.route('/').get(authentication, allMembers);
router.route("/profile/:id").get(authentication, memberDetails);

export default router;
