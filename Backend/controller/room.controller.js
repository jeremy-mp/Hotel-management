import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../helpers/CloudHelper.js";
import Room from "../model/room.js";
import  Booking  from "../model/booking.js";
import fs from "fs/promises"; // Use async fs module
import sendMail from "../util/sendmail.js";

export const CreateRooms = async (req, res) => {

    const { roomNumber, type, price, capacity, availableCount, amenities, description } = req.body;
    console.log(type);
    
    try {
        const existingRoom = await Room.findOne({ roomNumber });
        if (existingRoom) {
            return res.status(400).json({
                success: false,
                message: "This room already exists"
            });
        }

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
            return {
                url: result.url,
                publicId: result.publicId
            };
        }));

        // Parse amenities if sent as a string
        let parsedAmenities = amenities;
        if (typeof amenities === 'string') {
            try {
                parsedAmenities = JSON.parse(amenities);
            } catch (err) {
                parsedAmenities = amenities.split(",").map(item => item.trim());
            }
        }

        const room = new Room({
            roomNumber,
            type,
            price,
            capacity,
            availableCount,
            description,
            amenities: parsedAmenities || [],
            images: imageUploads
        });

        const savedRoom = await room.save();

        res.status(201).json({
            success: true,
            message: "Room created successfully",
            data: savedRoom
        });
    } catch (err) {
        console.error("Error in CreateRooms:", err);
        res.status(500).json({
            success: false,
            message: `${err}`
        });
    }
};

export const updateRoom = async (req, res) => {
    const { roomNumber, type, price, capacity, availableCount, amenities, description } = req.body;
    const roomId = req.params.id;
    console.log(roomId);
    console.log(roomNumber);
    
    
    try {
        // 1️⃣ Check if the room exists
        let existingRoom = await Room.findById(roomId);
        if (!existingRoom) {
            return res.status(404).json({
                success: false,
                message: "Room not found!",
            });
        }
        // 2️⃣ Handle image updates properly
        let updatedImages = existingRoom.images;
        if (req.files && req.files.length > 0) {
            // Delete old images from Cloudinary
            await Promise.all(existingRoom.images.map(img => cloudinary.uploader.destroy(img.publicId)));
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
          roomNumber: roomNumber || existingRoom.roomNumber,
          type: type || existingRoom.type,
          price: price || existingRoom.price,
          capacity: capacity || existingRoom.capacity,
          availableCount: availableCount || existingRoom.availableCount,
          amenities: Array.isArray(amenities)
              ? amenities
              : typeof amenities === "string"
              ? amenities.split(",").map(a => a.trim())
              : existingRoom.amenities,
          description: description || existingRoom.description,
          images: updatedImages,
      };
      
        // 4️⃣ Update room in the database
        const updatedRoom = await Room.findByIdAndUpdate(roomId, updatedData, { new: true });
        return res.status(200).json({
            success: true,
            message: "Room updated successfully!",
            data: updatedRoom,
        });

    } catch (err) {
        console.error("❌ Error in updating room:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const deleteRoom = async(req,res)=>{
    try {
        const roomId = req.params.id;
        const RoomExists = await Room.findById(roomId)
        if(!RoomExists){
            return res.status(400).json({
                success: false,
                message: "The room doesn't exists!",
            });
        }
        await Room.findByIdAndDelete(roomId)
        return res.status(200).json({
            success: true,
            message: "Room Deleted successfully!",
        });

    } catch (err) {
        console.error("❌ Error in Deleting room:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}


export const bookingRoom = async (req, res) => {
    try {
      const { roomType, checkInDate, checkOutDate, numberOfGuests } = req.body;
      const userId = req.session.user.id;
      const userEmail = req.session.user.email;
  
      // 1️⃣ Get available rooms of that type
      const rooms = await Room.find({ type: roomType });
      console.log(rooms);
      
      if (!rooms || rooms.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No rooms available of selected type",
        });
      }
  
      // 2️⃣ Check which room is available (no overlapping bookings)
      let assignedRoom = null;
  
      for (const room of rooms) {
        const isBooked = await Booking.findOne({
          roomId: room._id,
          $or: [
            {
              checkInDate: { $lt: new Date(checkOutDate) },
              checkOutDate: { $gt: new Date(checkInDate) },
            },
          ],
        });
  
        if (!isBooked) {
          assignedRoom = room;
          break;
        }
      }
  
      if (!assignedRoom) {
        return res.status(409).json({
          success: false,
          message: "No available rooms for selected dates",
        });
      }
  
      // 3️⃣ Save booking
      const newBooking = new Booking({
        userId,
        roomId: assignedRoom._id,
        checkInDate,
        checkOutDate,
        numberOfGuests,
      });
  
      const savedBooking = await newBooking.save();
  
      // 4️⃣ Send confirmation email
      if (userEmail) {
        await sendMail({
          to: userEmail,
          subject: "✅ Hotel Room Booking Confirmation",
          html: `
            <h2>Booking Confirmed!</h2>
            <p>Hi there,</p>
            <p>Your booking for <strong>Room ${assignedRoom.roomNumber}</strong> (${assignedRoom.type}) has been confirmed.</p>
            <p><strong>Check-In:</strong> ${new Date(checkInDate).toDateString()}</p>
            <p><strong>Check-Out:</strong> ${new Date(checkOutDate).toDateString()}</p>
            <p><strong>Guests:</strong> ${numberOfGuests}</p>
            <br/>
            <p>Thanks for choosing our hotel!</p>
          `,
        });
      }
  
      return res.status(201).json({
        success: true,
        message: `Room ${assignedRoom.roomNumber} booked successfully`,
        data: savedBooking,
      });
    } catch (err) {
      console.error("❌ Booking error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message,
      });
    }
  };


export const getAllBookedRooms = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("roomId", "roomNumber type price images") // Populate room details
      .populate("userId", "name email") // Optional: populate user details
      .sort({ createdAt: -1 }); // Latest bookings first

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No room bookings found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All room bookings fetched successfully.",
      data: bookings,
    });
  } catch (err) {
    console.error("❌ Error fetching bookings:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const checkIn = async (req, res) => {
    try {
      const bookingId = req.params.id;
      const booking = await Booking.findById(bookingId);
  
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
  
      const today = new Date();
      const checkInDate = new Date(booking.checkInDate);
  
      if (today < checkInDate) {
        return res.status(400).json({
          success: false,
          message: "Check-in not allowed before booking check-in date",
        });
      }
  
      if (booking.isCheckedIn) {
        return res.status(400).json({ success: false, message: "Already checked in" });
      }
  
      booking.isCheckedIn = true;
      await booking.save();
  
      return res.status(200).json({
        success: true,
        message: "Checked in successfully",
        data: booking,
      });
    } catch (err) {
      console.error("Check-in error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
  

  export const checkOut = async (req, res) => {
    try {
      const bookingId = req.params.id;
      const booking = await Booking.findById(bookingId);
  
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
  
      const today = new Date();
      const checkOutDate = new Date(booking.checkOutDate);
  
      if (!booking.isCheckedIn) {
        return res.status(400).json({
          success: false,
          message: "User must check-in before checking out",
        });
      }
  
      if (today < checkOutDate) {
        return res.status(400).json({
          success: false,
          message: "Check-out not allowed before booking check-out date",
        });
      }
  
      if (booking.isCheckedOut) {
        return res.status(400).json({ success: false, message: "Already checked out" });
      }
  
      booking.isCheckedOut = true;
      await booking.save();
  
      return res.status(200).json({
        success: true,
        message: "Checked out successfully",
        data: booking,
      });
    } catch (err) {
      console.error("Check-out error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
export const GetAllRooms = async(req,res) => {
  try {
      const GetAllRooms = await Room.find({})
      if(!GetAllRooms){
        res.status(200).json({
          success:false,
          message:"There are no rooms"
        })
      }
      res.status(200).json({
        success:true,
        Data:GetAllRooms
      })
    } catch (err) {
      console.error("Check-out error:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
}