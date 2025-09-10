import { Router } from "express";
import * as messageService from "./Services/messages.service.js";
import { authenticate } from "../../middlewares/auth.js";

const messageController = Router();



messageController.post('/send',authenticate, messageService.sendMessage)
messageController.delete('/delete/:id' , authenticate, messageService.deleteMessage)

export default messageController;