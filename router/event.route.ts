import express from "express";
import authentication from "../middleware/authentication";
import { addNewEvent, getAllEvents } from "../controller/event.Controller";

const router = express.Router();

router.route("/add").post( addNewEvent);
router.route("/").get( getAllEvents);

export default router
