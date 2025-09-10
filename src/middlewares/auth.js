import dotenv from 'dotenv';
import jwt from "jsonwebtoken"

export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
    return res.status(401).send('Token required');
    }
    jwt.verify(token, process.env.JWT_SECRET , (err, decoded) => {
    if (err) {
        return res.status(401).send('Invalid token');
    }
    req.user = {userId : decoded.userId}; 
    next();
    });
};


