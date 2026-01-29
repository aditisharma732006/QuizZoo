
const roleMiddleware = (requiredRole)=>{
    return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({message:'unauthorized'})
        }
        if(req.user.role != requiredRole)
        {
            return res.status(401).json({message:'access denied'})
        }
        next()
    }
}

export default roleMiddleware