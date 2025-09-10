import User from "../../../DB/models/users.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import encrypt from "../../../utils/encryption.utils.js";

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
        const user = await User.create({
            firstName,
            lastName,
            email,
            password : hashedPassword,
            phone : encryptedPhone,
            gender,
        });
        const userObj = user.toObject();
        delete userObj.password;
        res.status(201).json({message:"User signedUp successfully."})
    } catch (err) {
        console.error("SignUp error:", err);
        res.status(500).json({message:"server error"})
    }
};



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
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET , { expiresIn: '30d' });
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



// export 