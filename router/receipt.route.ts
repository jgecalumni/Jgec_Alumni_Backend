import express from "express";
import {
	approveReceipt,
	deleteReceipt,
	denyReceipt,
	getAllReceiptRequest,
	receiptRequest,
} from "../controller/receipt.controller";
import authentication from "../middleware/authentication";
import { upload } from "../middleware/photo-upload";

const router = express.Router();

// Routes for receipt
router.route("/request").post(upload.single("receipt"), receiptRequest);
router.route("/").get(getAllReceiptRequest);
router.route("/delete/:id").delete(deleteReceipt);
router.route("/approve/:id").patch(approveReceipt);
router.route("/deny/:id").patch(denyReceipt);

export default router;
