import Log from '../DB/models/logs.js';

export const logAction = async ({ method, route, user, status, message }) => {
    try {
        await Log.create({
        method,
        route,
        user,
        status,
        message
    });
    } catch (err) {
    console.error("Logging failed:", err.message);
    }
};