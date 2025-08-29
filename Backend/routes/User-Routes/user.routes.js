import {Router}  from "express"
import { bookingEvent, getEvents, getSingleEvent } from "../../controller/event.controller.js"
import { bookingRoom } from "../../controller/room.controller.js"

const user = Router()

//Getting all events 
user.get("/all-events",getEvents)
//Getting Single events Details 
user.get("/event/:id",getSingleEvent)
//Booking Events
user.post("/book-event/:id",bookingEvent)
//Booking the room for user 
user.post("/bookingRoom",bookingRoom)

export default user