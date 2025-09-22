import dotenv from 'dotenv';
import crypto from "crypto";
import fs from 'node:fs'
import { buffer } from 'node:stream/consumers';


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

//Asymmetric encryption


if (fs.existsSync('publicKey.pem') && fs.existsSync('privateKey.pem')){
    console.log('Key already generated');
    
}else {
    const {publicKey , privateKey} = crypto.generateKeyPairSync('rsa',{
        modulusLength:2048,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    })

    fs.writeFileSync('publicKey.pem', publicKey)
    fs.writeFileSync('privateKey.pem', privateKey)
}

export const asymmetricEncryption = (text)=>{
    const publicKey = fs.readFileSync('publicKey.pem', 'utf-8')
    const bufferedText = buffer.from(text)
    const encryptedData = crypto.publicEncrypt(
        {
            key:publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
        },
        bufferedText
    )
    return encryptedData.toString('hex')
}


export const asymmetricDecryption = (text)=>{
    const privateKey = fs.readFileSync('privateKey.pem', 'utf-8')
    const decryptedData = crypto.privateDecrypt(
        {
            key:privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
        },
        text
    )
    return decryptedData.toString('utf-8')
}