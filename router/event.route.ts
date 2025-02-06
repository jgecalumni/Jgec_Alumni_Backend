import express from "express";
import authentication from "../middleware/authentication";
import { addNewEvent, getAllEvents, updateEvent } from "../controller/event.Controller";

const router = express.Router();

router.route("/add").post( addNewEvent);
router.route("/").get( getAllEvents);
router.route("/update/:id").patch(updateEvent);

export default router
