import jwt from "jsonwebtoken";
import {v4 as uuidv4} from "uuid"



//generate token
export function generateToken(payload, secret, options = {}) {
    return jwt.sign(payload, secret, options);
}


//verify token
export function verifyToken(token, secret) {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
}