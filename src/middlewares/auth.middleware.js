import dotenv from 'dotenv';
import jwt from "jsonwebtoken"
import {verifyToken} from "../utils/token.utils.js"

export const authenticate = (req, res, next) => {
    const token = req.headers.accesstoken;
    if (!token) {
    return res.status(401).send('Token required');
    }
    const decoded= verifyToken(token , process.env.JWT_SECRET) ;
    if (!decoded) {
        return res.status(401).send('Invalid token');
    }
    req.user = {userId : decoded.userId}; 
    next();
    };


