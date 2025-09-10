import dotenv from 'dotenv';
import mongoose from "mongoose";


const dbConnection = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('DB Connected successfully')     
    } catch (error) {
        console.log('Connection failed', error.message);
    }
}

export default dbConnection