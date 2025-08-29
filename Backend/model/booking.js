import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    checkInDate: {
      type: Date,
      required: true
    },
    checkOutDate: {
      type: Date,
      required: true
    },
    numberOfGuests: {
      type: Number,
      required: true
    },
    isCheckedIn: {
      type: Boolean,
      default: false
    },
    isCheckedOut: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: true
  });
  
const Booking = mongoose.model("Booking",bookingSchema)
export default Booking