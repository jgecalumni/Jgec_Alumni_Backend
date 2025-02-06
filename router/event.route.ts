import express from "express";
import authentication from "../middleware/authentication";
import {
	addNewEvent,
	deleteEvent,
	getAllEvents,
	getEventByID,
	updateEvent,
} from "../controller/event.Controller";

const router = express.Router();

router.route("/add").post(addNewEvent);
router.route("/").get(getAllEvents);
router.route("/update/:id").patch(updateEvent);
router.route("/delete/:id").delete(deleteEvent);
router.route("/:id").get(getEventByID);

export default router;
