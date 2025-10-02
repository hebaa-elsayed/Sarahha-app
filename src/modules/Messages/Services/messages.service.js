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


export const getUserMessages = async (req, res) => {
    try {
        const userId = req.user.userId;
        const messages = await Message.find({ receiver: userId }).sort({ createdAt: -1 });
        res.status(200).json({message: "User messages retrieved successfully", data: messages});
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


export const makeMessagePublic = async (req, res) => {
    try {
        const userId = req.user.userId;
        const messageId = req.params.id;
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        if (message.receiver.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to make this message public' });
        }
        message.isPublic = true;
            await message.save();
                res.status(200).json({ message: 'Message is now public', data: message });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


export const getPublicMessages = async (req, res) => {
    try {
        const messages = await Message.find({ isPublic: true }).sort({ createdAt: -1 });
            res.status(200).json({message: "Public messages retrieved successfully",data: messages});
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};