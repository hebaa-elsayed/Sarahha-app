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
        const {email,password,deviceId}= req.body;
        const user = await User.findOne({email});
        if (!user){
            return res.status(400).json({message:"Invalid email or password"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400).json({message:"Invalid email or password"})
        }
        const activeDevices = user.devices || [];
        const isNewDevice = !activeDevices.includes(deviceId);
        if (isNewDevice && activeDevices.length >= 2) {
            return res.status(403).json({ message: "Maximum device limit reached" });
        }
        if (isNewDevice) {
            activeDevices.push(deviceId);
            user.devices = activeDevices;
            await user.save();
        }
        const accessToken = generateToken({ userId: user._id , email: user.email }, 
                process.env.JWT_SECRET ,
                { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN , jwtid : uuidv4() });
        
        const refreshToken = generateToken(
                { userId: user._id , email: user.email},
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN , jwtid:uuidv4() });

        res.json({ message:"Login successful", accessToken, refreshToken });
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
};


export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

    const OTP = uniqueString();
    user.otps.resetPassword = await bcrypt.hash(OTP, 10);
    await user.save();

    emitter.emit('sendEmail', {
        to: email,
        subject: 'Reset Password OTP',
        content: `Your OTP to reset password is: ${OTP}`
    });

    res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { email, OTP, newPassword } = req.body;

        if (!email || !OTP || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

    const user = await User.findOne({ email, isConfirmed: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found or not confirmed' });
        }

    const isOtpMatched = bcrypt.compareSync(OTP, user.otps?.resetPassword);
        if (!isOtpMatched) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otps.resetPassword = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const updatePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Both old and new passwords are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    };
};



export const resendEmail = async (req, res) => {
    try {
        const { email, type } = req.body;
        if (!email || !type) {
            return res.status(400).json({ message: 'Email and type are required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const OTP = uniqueString();
        const hashedOTP = await bcrypt.hash(OTP, 10);

        switch (type) {
            case 'confirmation':
                user.otps.confirmation = hashedOTP;
                emitter.emit('sendEmail', {
                        to: email,
                        subject: 'Confirm Your Email',
                        content: `Your confirmation OTP is: ${OTP}`
            });
        break;
            case 'resetPassword':
                user.otps.resetPassword = hashedOTP;
                emitter.emit('sendEmail', {
                to: email,
                subject: 'Reset Your Password',
                content: `Your reset OTP is: ${OTP}`
            });
        break;
        default:
            return res.status(400).json({ message: 'Invalid type' });
        }
        await user.save();
            res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const refreshToken = async (req, res) => {
    try {
        const  {refreshToken} = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        const decoded = verifyToken(refreshToken , process.env.JWT_REFRESH_SECRET);
        const newAccessToken = generateToken(
            { userId: decoded.userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN, jwtid: uuidv4() }
        );

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};
