import dotenv from 'dotenv';
import nodemailer from "nodemailer";

export const sendEmail = async (
    {
        to,
        subject,
        content,
        attachments =[]
    }
) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", //smtp.gmail.com
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // tls:{
        //     rejectUnauthorized:false
        // }
    });


    const Info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: content,
        attachments
    })
    console.log(`info` , Info);
    
    return Info
};

export default sendEmail;

import { EventEmitter } from 'node:events';
export const emitter = new EventEmitter()


emitter.on('sendEmail' , (args)=>{
    console.log("Sending email event is working");
    sendEmail(args)
})