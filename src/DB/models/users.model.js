import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true 
    },
    lastName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    password : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : false
    },
    isDeleted :{
        type : Boolean,
        default : false
    },
    gender :{
        type : String,
        enum : ["female" , "male"],
        required : false
    },
    otps :{
        confirmation: String,
        resetPassword: String
    },
    isConfirmed:{
        type: Boolean,
        default: false
        }
    },
    {timestamps : true}
);


userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});


userSchema.methods.getFullName = function () {
    return `${this.firstName} ${this.lastName}`.toUpperCase();
};


userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });


const User = mongoose.model("User", userSchema);

export default User;