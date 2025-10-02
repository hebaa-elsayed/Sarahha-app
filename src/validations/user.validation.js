import Joi from 'joi';

export const updatePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')).required()
});




export const confirmEmailSchema = Joi.object({
    email: Joi.string().email().required().messages({
    'string.email': 'Email is not valid',
    'any.required': 'Email is required'
    }),
    OTP: Joi.string().length(7).alphanum().required().messages({
    'string.length': 'OTP must be 7 characters',
    'string.alphanum': 'OTP must be numbers and alphapitics only',
    'any.required': 'OTP is required'
    })
});