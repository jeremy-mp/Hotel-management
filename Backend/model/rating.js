import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    referenceId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    referenceType: {
        type: String,
        enum: ["room", "event"],
        required: true,
      },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        trim: true,
     }
},
{
    timestamps:true
}
)

const Rating = mongoose.model("Rating",ratingSchema)

export default Rating
