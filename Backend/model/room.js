import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["single", "double", "suite"],
    },
    price: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    availableCount: {  // Fixed typo (availabeCount -> availableCount)
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true, // Fixed (was `required: String`)
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now, // Fixed (no need to call Date.now())
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Corrected model export
const Room = mongoose.model("Room", roomSchema);

export default Room;
