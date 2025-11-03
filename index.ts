import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

// router imports
import AuthRoute from "./router/auth.route";
import ScholarshipRoute from "./router/scholarship.route";
import NoticeRoute from "./router/notice.route";
import EventRoute from "./router/event.route";
import DocRoute from "./router/document.route";
import GalleryRoute from "./router/gallery.route"
import ReceiptRoute from "./router/receipt.route";
import ContributionRoute from "./router/contribution.route";

import { allCounts } from "./controller/count.controller";
import authentication from "./middleware/authentication";

// configure middlewares
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
	cors({
		origin: [
			process.env.FORNTEND_URI_DEV as string,
			process.env.FORNTEND_URI_PROD as string,
			process.env.FORNTEND_URI_MAIN as string,
			process.env.FORNTEND_URI_MAIN_TWO as string,
		],
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		credentials: true,
	})
);

// declare routes
app.get("/", (req, res) => {
	res.send("Hello World!");
});

// routes
app.use("/v1/api/auth/member", AuthRoute);
app.use("/v1/api/scholarships", ScholarshipRoute);
app.use("/v1/api/notice", NoticeRoute);
app.use("/v1/api/events", EventRoute);
app.use("/v1/api/documents", DocRoute);
app.use("/v1/api/gallery", GalleryRoute);
app.use("/v1/api/all-count", authentication, allCounts);
app.use("/v1/api/receipt", ReceiptRoute);
app.use("/v1/api/contributions", ContributionRoute);


app.listen(port, () => console.log("🚀[Server]: listening on port " + port));
