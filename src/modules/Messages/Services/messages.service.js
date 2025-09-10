import Message from "../../../DB/models/messages.model.js";



export const sendMessage = async (req,res) => {
    try {
        const senderId = req.user.userId;
        const {receiverId, content } = req.body;
        if (!receiverId || !content) {
            return res.status(400).json({ Message : "Receiver and content are required"});
        }
        const message = new Message ({
            sender: senderId,
            receiver: receiverId,
            content
        });
        await message.save();
        return res.status(201).json({
            message:"Message sent successfuly",
            data: message
        })
    } catch (error) {
        res.status(500).json({message:"internal server error", error:error.message})
    }
};


export const deleteMessage = async (req, res) => {
    try {
        const userId = req.user.userId; 
        const messageId = req.params.id;
        console.log("Message ID:", req.params.id);
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
            };
        if (message.receiver.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this message" });
            }
        await Message.findByIdAndDelete(messageId);
            res.json({ message: "Message deleted successfully" });
    } catch (error) {
        console.error("Delete message error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


