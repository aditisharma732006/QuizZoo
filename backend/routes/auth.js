import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

const ACCESS_SECRET = process.env.ACCESS_SECRET
const REFRESH_SECRET = process.env.REFRESH_SECRET

//POST /auth/register -register a new user
// sign up - 1.validation - check if user already exists
//2.hash the password
//3.store user in db
router.post('/register',async(req,res)=>{
    try {
    const {name,email,password,role}=req.body;

    if(!name || !email || !password){
        return res.status(400).json({message : 'All fields are required'})
    }
    const existingUser = await User.findOne({email})
    if(existingUser){
        return res.status(400).json({message : 'User already exists'})
    }
    const user = await User.create({name,email,password,role})
    res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
    })
    } catch (error) {
        res.status(500).json({message : 'Server error'})
    }
    
})

//post /auth/login -login a user
//1.find user by email
//2.compare hash password
//3.generate a token JWT
router.post('/login',async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({message : 'All fields are required'})
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({message : 'Invalid credentials'})
        }
        const isMatch= bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(401).json({message : 'Invalid credentials'})
        }

        const payload = {
            id : user._id,
            role : user.role 
        }
        const accessToken= jwt.sign(payload,ACCESS_SECRET,{expiresIn : "15min"})
        const refreshToken=jwt.sign(payload,REFRESH_SECRET,{expiresIn : "7d"})

        //save refreshToken in db
        user.refreshTokens.push(refreshToken)
        await user.save()

        //Send refresh token as HTTP-only cookie
        res.cookie('refreshToken',refreshToken, {httpOnly:true , secure:true, sameSite:'strict', maxAge: 7*24*60*60*1000})


        res.status(200).json({message : 'Login successful', 
            accessToken,
            user :{
                id : user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    }
    catch (error) {
        res.status(500).json({message : 'Server error'})
    }
})

router.post('/refresh', async(req,res)=>{
    const refreshToken=req.cookies.refreshToken // Assuming frontend sent it as cookie
    if(!refreshToken) return res.status(401).json({message:'refresh token not found'})
    try{
        const payload=jwt.verify(refreshToken, REFRESH_SECRET)
        const user=User.findById(payload.id)

        if(!user.refreshTokens.includes(refreshToken))
            return res.status(401).json({message:'Invalid refresh token'})

        // Token rotation: remove old refresh token
        user.refreshTokens= user.refresTokens.filter((t)=>{t !== refreshToken})
        const newRefreshToken=jwt.sign({id : user._id , role : user.role},REFRESH_SECRET,{expiresIn: "7d" })
        user.refresTokens.push(newRefreshToken)
        await user.save()

         res.cookie('refreshToken',newRefreshToken,{httpOnly:true , secure:true, sameSite:'strict', maxAge: 7*24*60*60*1000})

        //send new accessToken
        const accessToken=jwt.sign({id:user._id , role:user.role},ACCESS_SECRET,{expiresIn: "15min" })
        res.status(200).json({accessToken})

    }
    catch(error){
        return res.status(401).json({ message: 'Invalid or expired refresh token' })
    }
})

router.post('/logout',async(req,res)=>{
    const refreshToken=req.cookies.refreshToken
    if(!refreshToken)    return res.status(401).json({ message: 'refresh token not found' })
    try{
        const payload=jwt.verify(refreshToken,REFRESH_SECRET)

        const user=User.findById(payload.id)
        //clear it from db
        if(user){
            user.refreshTokens=user.refresTokens.filter((t)=>{ t!== refreshToken})
            await user.save()
        }
        //clear cookie too
        res.clearCookie('refreshToken',{httpOnly:true , secure:true, sameSite:'strict'})
        res.status(200).json({message:'logout successful'})
    }catch(error){
        //even refreshcookie is expired better to remove it from cookie to 
        res.clearCookie('refreshToken',{httpOnly:true , secure:true, sameSite:'strict'})
        res.status(200).json({message:'logout successful'})
    }

})

export default router


//why we need token?
//backend never trust frontend
//Frontend must prove identity on every request.
//that proof = token
