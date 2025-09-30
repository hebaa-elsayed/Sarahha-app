
import BlackListedTokens from '../DB/models/black-listed-tokens.model.js';

export const cleanExpiredTokens = async () => {
    try {
        const now = new Date();
        const result = await BlackListedTokens.deleteMany({
        expirationDate: { $lt: now }
    });
        console.log(`Cron: Deleted ${result.deletedCount} expired tokens`);
    } catch (error) {
        console.error('Cron error:', error.message);
    }
};