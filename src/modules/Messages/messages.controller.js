import { Router } from "express";
import * as messageService from "./Services/messages.service.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {validate} from "../../validations/validate.middleware.js";
import {sendMessageSchema, makePublicSchema} from "../../validations/message.validation.js"


const router = Router();



router.post('/send',authenticate, validate(sendMessageSchema),messageService.sendMessage);
router.delete('/delete/:id' , authenticate, messageService.deleteMessage);
router.get('/messages' , authenticate , messageService.getUserMessages);
router.patch('/:id/public', authenticate,validate(makePublicSchema, 'params'), messageService.makeMessagePublic);
router.get('/public', authenticate , messageService.getPublicMessages);

export default router;