
import mongoose from "mongoose"


const blackListedTokensSchema = new mongoose.Schema({
    tokenId: {type:String , required: true , unique: true},
    expirationDate: {type:Date , required:true},
    userId:{type:mongoose.Schema.Types.ObjectId , required: true , ref:'User'}
})

const BlackListedTokens = mongoose.model("BlackListedTokens" , blackListedTokensSchema)
export default BlackListedTokens