import mongoose from "mongoose"

//userId -refers to the id of document in User collection
//if i user string instead of ObjectId , it will not create relationship between collections and don't know which collection it is referring to
//quizId -refers to the id of document in Quiz collection
const resultSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    quizId:{    
        type:mongoose.Schema.Types.ObjectId,
        ref:'Quiz',
        required:true
    },
    answers: {
        type:[Number],
        required:true
    },
    score:{
        type:Number,
        required:true
    },

    
},{timestamps:true})

export default mongoose.model('Result', resultSchema)