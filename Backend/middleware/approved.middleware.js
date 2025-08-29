import User from "../model/user.js"

const checkManager = async(req,res,next) => {
    console.log("Session:", req.session);
    try {
        const managerId = req.session.user.id
        console.log(managerId);
        

    const Manager = await User.findById(managerId)

   if(!Manager.isApproved){
    return res.status(403).json({
        success:false,
        message:"You are not Approved Yet"
    })
   }
   next()
    } catch (err) {
       return res.status(500).json({
            success:false,
            message:"Internal Server Error Manager approvel!",
            error:err
        })
    }
}

export default checkManager