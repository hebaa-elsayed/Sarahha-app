import Joi from 'joi';

export const sendMessageSchema = Joi.object({
    content: Joi.string().min(1).max(500).required(),
    receiverId: Joi.string().length(24).required()
});

export const makePublicSchema = Joi.object({
    id: Joi.string().length(24).required()
});