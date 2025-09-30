import jwt from "jsonwebtoken";
import {v4 as uuidv4} from "uuid"



//generate token
export function generateToken(payload) {
    return jwt.sign(payload , process.env.JWT_SECRET, {expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ,jwtid : uuidv4() });
}


//verify token
export function verifyToken(token) {
    try {
        return jwt.verify(token , process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}