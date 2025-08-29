import mongoose from "mongoose";

const ConnectDb = () => {
    mongoose.connect(process.env.MONGO_URL).then(()=>{
        console.log(`Mongo Connected -- > ${process.env.MONGO_URL}`);
    }).catch((e)=>{
        console.log(`There is a Error --> ${e}`);
        process.exit(1)
    })
}

export default ConnectDb