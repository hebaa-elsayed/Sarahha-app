import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    method: String,
    route: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    status: Number,
    message: String
    }, 
    {
    capped: true,
    size: 1048576, 
    max: 1000
});


const Log = mongoose.model("Log",logSchema)

export default Log;