import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const userSchema = new mongoose.Schema({
    "name": String,
    "email":String,
    "password":String,
    "role": {
        type: String,
        enum : ['admin','user'],
        default: 'user'
    },
    "refreshTokens":{
        type:String,
        default:[]
    }
})
//Run this function automatically BEFORE saving a User document to the database
//'save' is a event we are listening to
//.pre() runnes every time when .save or .create calls ,'save' event will get triggered
//why in models? bcoz model is responsible for security, Easy to forget hashing in another route
userSchema.pre('save', async function(){
    if(!this.isModified('password')) return
    const hashPassword= bcrypt.hash(this.password,10)

})
//this = the current user document being saved
//isModified means Has the password field changed in this document eg new or updated then only hash

export default mongoose.model('User',userSchema)