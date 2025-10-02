import { Router } from "express";
import * as messageService from "./Services/messages.service.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();



router.post('/send',authenticate, messageService.sendMessage);
router.delete('/delete/:id' , authenticate, messageService.deleteMessage);
router.get('/messages' , authenticate , messageService.getUserMessages);
router.patch('/:id/public', authenticate, messageService.makeMessagePublic);
router.get('/public', authenticate , messageService.getPublicMessages);

export default router;