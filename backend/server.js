import express from 'express'
import quizzesRouter from './routes/quizzes.js'
import authRouter from './routes/auth.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'

import mongoose from 'mongoose'

dotenv.config()

const app=express()

//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));


//routes
app.get('/',(req,res)=>{
    res.send('Welcome to QuizZoo API')
})
app.use('/api/auth',authRouter)
app.use('/api/quizzes',quizzesRouter)


const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log(`app is listening at port ${PORT}`)
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));
})