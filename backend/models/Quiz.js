import mongoose from "mongoose"
const questionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctOptionIndex : Number
})
const quizSchema = new mongoose.Schema({
    title : String,
    description : String,
    questions : [questionSchema]
})

export default mongoose.model('Quiz', quizSchema)


//model name-Quiz (collection name - quizzes)
//schema - quizSchema