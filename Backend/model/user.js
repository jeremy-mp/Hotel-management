import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        enum:["user","admin","manager"]
    },
    url: {
        type: String,
        required: true,
    },
  
    publicId: {
        type: String,
        required: true,
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    isApproved:{
        type:Boolean,
        default:false
    }
},
{
    timestamps:true
}
)

const User = mongoose.model("Users",UserSchema)

export default User