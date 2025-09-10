import dotenv from 'dotenv';
import crypto from "crypto";


const ENCRYPTION_KEY= Buffer.from(process.env.ENCRYPTION_KEY, 'utf-8' );
const IV_LENGHT = 16;

export function encrypt(text){
    const iv = crypto.randomBytes(IV_LENGHT);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY ,iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')} : ${encrypted}`;
}



export function decrypt(text) {
    const [ivHex, encryptedText] = text.split(":");
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY , iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


export default encrypt