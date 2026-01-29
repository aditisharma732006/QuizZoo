import express from 'express'
import Quiz from '../models/Quiz.js'
import Result from '../models/Result.js'
import authMiddleware from '../middleware/authMiddleware.js'   
import roleMiddleware from '../middleware/roleMiddleware.js'
const router=express.Router()

//CRUD operations for quizzes
//.find --> to get all documents from a collection
//.findById --> to get a single document by its id
//.create --> to create a new document
//.findByIdAndUpdate --> to update a document by its id
//.findByIdAndDelete --> to delete a document by its id

router.use(authMiddleware)
//GET   /quizzes -list all quizzes (user + admin)
router.get('/',async(req,res)=>{
    const quizzes = await Quiz.find()
    res.json(quizzes)
})


//POST  /quizzes -add quiz (admin only)
router.post('/',roleMiddleware('admin'), async(req,res)=>{
    const quiz = await Quiz.create(req.body);

  res.json(quiz);
})

//get results of all quizzes (admin)
router.get('/results',roleMiddleware('admin'),async(req,res)=>{
    const results = await Result.find().populate('userId','name email').populate('quizId','title')
    res.json(results)
    
})
//populate() gets the full document instead of just the ObjectId. 
// If I use only find(), then the frontend will need more APIs because it returns only ObjectIds.
//above code eg- gets only name and email from User collection and title from Quiz collection

router.get('/results/me',roleMiddleware('user'),async(req,res)=>{
    const userId=req.user.id
    const results=await Result.find({userId}).populate('quizId', 'title').sort({createdAt:-1})
    const formattedResults = results.map((r, index) => ({
        resultId: r._id,
        quizTitle: r.quizId.title,
        score: r.score,
        totalQuestions: r.answers.length,
        createdAt: r.createdAt,
        isLatest: index === 0
    }))

    res.json(formattedResults)
})

//submit an attempt for a specific quiz (user only)
router.post('/:id/submit',roleMiddleware('user'), async(req,res)=>{
    try {
    const {answers}=req.body
    const userId=req.user.id
    const quizId=req.params.id

    if(!userId || !answers){
        return res.status(400).json({'message':'data is missing'})
    }
    const quiz = await Quiz.findById(quizId)
    if(!quiz){
        return res.status(404).json({'message':'quiz not found'})
    }
    let score=0;
    quiz.questions.forEach((question,index)=>{
        if(question.correctOptionIndex === answers[index]){
            score++
        }
    })
    const result =await Result.create({
        userId,
        quizId,
        answers,
        score
    })
    
    res.status(200).json({message:'Quiz submitted successfully',  result: {
                resultId: result._id,
                quizTitle: quiz.title,
                score,
                totalQuestions: quiz.questions.length,
                createdAt: result.createdAt
            }})

    } catch (error) {
        res.status(500).json({message : 'Server error'})
    }
})

//PUT   /quizzes/:id -update quiz (admin only)
router.put('/:id',roleMiddleware('admin'), async(req,res)=>{
    const updatedQuiz= await Quiz.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new : true})
    res.json(updatedQuiz)
})


//DELETE    /quizzes/:id -delete quiz (admin only)
router.delete('/:id',roleMiddleware('admin'), async(req,res)=>{
    const deletedQuiz= await Quiz.findByIdAndDelete(req.params.id)
    res.json(deletedQuiz)
})


//GET/quizzes/:id -fetch quiz with questions (user only)
router.get('/:id',roleMiddleware('user'), async(req,res)=>{
    const quiz = await Quiz.findById(req.params.id)
    res.json(quiz)
})







export default router