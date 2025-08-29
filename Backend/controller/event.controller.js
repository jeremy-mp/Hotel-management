import { uploadToCloudinary } from "../helpers/CloudHelper.js";
import fs from "fs"
import Event from "../model/event.js";
import cloudinary from "../config/cloudinary.js";

export const createEvent = async(req,res)=>{
    const {name,description,location,date,capacity,price} = req.body
    try {
        if (!req.files || req.files.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "At least one image is required"
                    });
                }
        
                // Upload all files in parallel using Promise.all
                const imageUploads = await Promise.all(req.files.map(async (file) => {
                    console.log("Uploading to Cloudinary:", file.path);
                    const result = await uploadToCloudinary(file.path);

                    console.log("Deleted file after upload:", file.path);
        
                    return {
                        url: result.url,
                        publicId: result.publicId
                    };
                }));

                 const event = new Event({
                    name,description,location,date,capacity,price,images:imageUploads
                 })
                 const savedEvent = await event.save()
                 return res.status(200).json({message:"Event Created successfully!"})
    } catch (err) {
        console.log(err);
        res.status(400).json({message:"Something went wrong"})
    }
}

export const getEvents = async(req,res)=>{
    try {
        const getEvents =await Event.find({});
        res.status(200).json({message:"All events!",data:getEvents})
        
    } catch (err) {
        console.log(err);
        res.status(500).json({message:"something went Wrong!",data:getEvents})
    }
    
}

export const getSingleEvent = async(req,res)=>{
    try {
        const id = req.params.id;
        const getEvent =await Event.findById(id);
        res.status(200).json({message:"All events!",data:getEvent})
        
    } catch (err) {
        console.log(err);
        res.status(500).json({message:"something went Wrong!"})
    }
    
}

export const bookingEvent = async (req, res) => {
    const userId = req.session.user.id;
    const eventId = req.params.id;

    try {
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "No Event Found",
            });
        }

        if (event.bookedUsers.includes(userId)) {
            return res.status(203).json({
                success: false,
                message: "You are already booked",
            });
        }

        if (event.bookedUsers.length >= event.capacity) {
            return res.status(400).json({
                success: false,
                message: "Sorry, you are late. Event is fully booked.",
            });
        }

        event.bookedUsers.push(userId);
        await event.save();

        return res.status(200).json({
            success: true,
            message: "You booked successfully",
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

export const updateEvent = async(req,res)=>{
    const {name,description,location,date,capacity,price} = req.body
    const eventId = req.params.id
    try {
        let existingEvent = await Event.findById(eventId);
        if (!existingEvent) {
            return res.status(404).json({
                success: false,
                message: "Event not found!",
            });
        }

        // 2️⃣ Handle image updates properly
        let updatedImages = existingEvent.images;
        if (req.files && req.files.length > 0) {
            // Delete old images from Cloudinary
            await Promise.all(existingEvent.images.map(img => cloudinary.uploader.destroy(img.publicId)));

            // Upload new images to Cloudinary
            updatedImages = await Promise.all(
                req.files.map(async (file) => {
                    const { url, publicId } = await uploadToCloudinary(file.path);
                    return { url, publicId };
                })
            );
        }

        // 3️⃣ Prepare update data (keep existing values if not provided)
        const updatedData = {
            name:name || existingEvent.name
            ,description:description || existingEvent.description
            ,location:location || existingEvent.location
            ,date:date || existingEvent.date
            ,capacity:capacity || existingEvent.capacity
            ,price:price || existingEvent.price
            ,images:updatedImages
        };

        // 4️⃣ Update room in the database
        const updatedEvent = await Event.findByIdAndUpdate(eventId, updatedData, { new: true });

        return res.status(200).json({
            success: true,
            message: "Event updated successfully!",
            data: updatedEvent,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
}

export const deleteEvent = async(req,res)=>{
    try {
        const eventId = req.params.id;
        const EventExists = await Event.findById(eventId)
        if(!EventExists){
            return res.status(400).json({
                success: false,
                message: "The event doesn't exists!",
            });
        }
        await Event.findByIdAndDelete(eventId)
        return res.status(200).json({
            success: true,
            message: "Event Deleted successfully!",
        });

    } catch (err) {
        console.error("❌ Error in Deleting event:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
