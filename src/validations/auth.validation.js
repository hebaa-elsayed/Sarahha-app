import Joi from 'joi';


export const signupSchema = Joi.object({
    firstName: Joi.string().min(2).max(30).required(),
    lastName: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    
    password: Joi.string().pattern(
    new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
    ).required().messages({
    'string.pattern.base': 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
    }),
    
    phone: Joi.string().pattern(new RegExp('^(01)[0-9]{9}$')).required().messages({
    'string.pattern.base': 'Phone number must be a valid Egyptian number starting with 01 and 11 digits total.'}),
    
    gender: Joi.string().valid('male', 'female').required()
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email is not valid',
        'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
    'any.required': 'Password is required'
    }),
    deviceId: Joi.string().alphanum().min(3).max(30).required().messages({
    'any.required': 'Device ID is required'
    })
});