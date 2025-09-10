import { logAction } from '../utils/logger.js';

export const loggerMiddleware = async (req, res, next) => {
    res.on('finish', async () => {
        await logAction({
            method: req.method,
            route: req.originalUrl,
            user: req.user?.userId || null,
            status: res.statusCode,
            message: `Request to ${req.originalUrl}`
        });
    });
    next();
};