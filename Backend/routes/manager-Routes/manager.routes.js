import express from "express"
import uploadMiddleware from "../../middleware/uploadMiddleware.js"
import { createEvent, deleteEvent, getEvents, updateEvent } from "../../controller/event.controller.js"
import { checkIn, checkOut, CreateRooms, deleteRoom, getAllBookedRooms, GetAllRooms, updateRoom } from "../../controller/room.controller.js"

const Manager = express.Router()

Manager.post("/create-rooms", uploadMiddleware.array("images", 10), CreateRooms)

Manager.put("/update-rooms/:id",uploadMiddleware.array("images", 10),updateRoom)

Manager.get("/get-all-rooms",GetAllRooms)

Manager.delete("/delete-rooms/:id",deleteRoom)

Manager.post("/create-event",uploadMiddleware.array("images", 10),createEvent)

Manager.get("/get-all-event",getEvents)

Manager.put("/update-event/:id",uploadMiddleware.array("images", 10),updateEvent)

Manager.delete("/delete-event/:id",deleteEvent)

Manager.get("/bookings",getAllBookedRooms)

Manager.put("/check-in/:id",checkIn)

Manager.put("/check-out/:id",checkOut)

export default Manager