import express from "express";
import {
    loginMember,
    memberDetails,
    registerMember,
} from "../controller/auth.controller";
import { upload } from "../middleware/photo-upload"; 

const router = express.Router();

router.route("/register").post(
    upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "receipt", maxCount: 1 },
    ]), 
    registerMember
);
router.route("/login").post(loginMember);
router.route("/profile/:id").get(memberDetails);

export default router;
