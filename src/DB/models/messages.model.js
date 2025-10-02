import mongoose from "mongoose";

const messageSchema= new mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    content:{
        type:String, 
        required:true
        },
    receiver:{
        type:mongoose.Schema.Types.ObjectId, 
            ref:"User",
            required:true
        },
        isPublic: {
        type: Boolean, 
        default: false 
        },
    }, 
{timestamps:true}
);

messageSchema.set('toJSON', {
    transform: function (doc, ret) {
    delete ret.sender;
    return ret;
    }
});

const Message = mongoose.model("Message",messageSchema)

export default Message;