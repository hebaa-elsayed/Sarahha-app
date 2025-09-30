import User from "../../../DB/models/users.model.js";
import jwt from "jsonwebtoken";
import {generateToken , verifyToken} from "../../../utils/token.utils.js"
import { v4 as uuidv4 } from "uuid"
import bcrypt, { compareSync } from "bcrypt";
import {encrypt , decrypt , asymmetricDecryption , asymmetricEncryption} from "../../../utils/encryption.utils.js";
import {emitter, sendEmail} from '../../../utils/send-email.utils.js';
import { customAlphabet } from "nanoid";
import BlackListedTokens from "../../../DB/models/black-listed-tokens.model.js"
const uniqueString = customAlphabet('1234567890abcd' , 7)


export const signUp = async (req,res) => {
    try {
        const {firstName , lastName , email, password, phone, gender} = req.body;
        
        if (!firstName || !lastName || !email || !password || !phone ) {
            return res.status(400).json({message:"All required fields must be provided! "});
        }
        const exists = await User.findOne({email});
        if (exists) {
            return res.status(400).json({message:"Email already exists."});
        }
        const hashedPassword = await bcrypt.hash(password, 8);
        const encryptedPhone = encrypt(phone);
        const OTP = uniqueString()
        const user = await User.create({
            firstName,
            lastName,
            email,
            password : hashedPassword,
            phone : encryptedPhone,
            gender,
            otps:{confirmation: await bcrypt.hash(OTP , 10)}
        });
        
    emitter.emit('sendEmail' , {
        to : email,
        subject:'Confirmation Email',
        content: 
        `
        Your confirmation OTP is :  ${OTP}
        `
    })
        const userObj = user.toObject();
        delete userObj.password;
        res.status(201).json({message:"User signedUp successfully." , user})
    } catch (err) {
        console.error("SignUp error:", err);
        res.status(500).json({message:"server error"})
    }
};



export const ConfirmEmailService = async(req,res)=>{
        const {email , OTP} = req.body
        const user = await User.findOne({email , isConfirmed:false})
        if(!user){
            return res.status(400).json({message:'User not found or already confirmed'})
        }
        const isOtpMatched = compareSync(OTP , user.otps?.confirmation)
        if(!isOtpMatched){
            return res.status(400).json({message: "Invalid OTP"})
        }
        user.isConfirmed = true
        user.otps.confirmation = undefined
        await user.save()
        res.status(200).json({message : "Confirmed"})
}


export const login = async (req,res) => {
    try {
        const {email,password}= req.body;
        const user = await User.findOne({email});
        if (!user){
            return res.status(400).json({message:"Invalid email or password"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400).json({message:"Invalid email or password"})
        }
        const token = generateToken({ userId: user._id , email: user.email }, 
                                process.env.JWT_SECRET ,
                                { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN , jwtid : uuidv4() });
        res.json({ message:"Login successful", token });
    } catch (error) {
        console.log("Login error",error.message);
    res.status(500).json({message:"server error", error:error.message});
    }
};



export const updateUser =async (req,res) => {
    try {
        const userId = req.user.userId;
        
        const {email, firstName, lastName , phone, gender} = req.body;
        
        const user = await User.findById(userId)
        
        if (!user) {
            return res.status(404).json({ message : "user not found"})
        }
        const updatedUser = {}
        if (firstName) updatedUser.firstName = firstName;
        if (lastName) updatedUser.lastName = lastName;
        if (phone) {
            const encryptedphone = encrypt(phone);
            updatedUser.phone = encryptedphone;
            }
        if (gender) updatedUser.gender = gender;
        if (email) {
            const emailExists = await User.findOne({email})
            if (emailExists) {
                return res.status(400).json({ message: "email already exists"})
            }
            updatedUser.email = email
        }
        const newData = await User.findByIdAndUpdate(userId , updatedUser , {new : true})
        return res.status(200).json({
            message: "User updated successfully" , user: {
            firstName: newData.firstName,
            lastName: newData.lastName,
            email: newData.email,
            phone : updatedUser.phone,
            gender: newData.gender,
            }
        })
    } catch (error) {
        res.status(500).json({message:"server error", error:error.message});
    }
};



export const deleteUser = async (req,res) => {
    try {
        const userId = req.user.userId;
        const deletedUser =  await User.findByIdAndDelete(userId)
        if(!deletedUser){
            return res.status(404).json({ nessage: "User not found"})
        }
        return res.status(200).json({
            message: "User deleted successfully",
            userId : deletedUser.userId
        })
    }
    catch (error) {
        res.status(500).json({message:"server error", error:error.message});
    }
};



export const getUser = async (req,res) => {
    try {
        const userId = req.user.userId;
        const user =  await User.findById(userId).select("-password -phone")
        if(!user){
            return res.status(404).json({ nessage: "User not found"})
        }
        return res.status(200).json({
            message: " Here is the user info",
            user
        })
    }
    catch (error) {
        res.status(500).json({message:"server error", error:error.message});
    }
};


export const LogOut = async (req , res) => {
    try {
        const accesstoken = req.headers.accesstoken
        const decodedData = verifyToken(accesstoken)
        const expirationDate = new Date(decodedData.exp * 1000)
        const BlackListedToken = await BlackListedTokens.create({
            tokenId:decodedData.jti,
            expirationDate,
            userId:decodedData.userId
        })
        return res.status(200).json({message:"User logged out successfully"})
    } catch (error) {
        res.status(500).json({message:"server error", error:error.message});
    }
}