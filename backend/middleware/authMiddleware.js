import jwt from  'jsonwebtoken'

const authMiddleware = (req,res,next)=>{
    try{
    const authHeader=req.headers.authorization
    if(!authHeader){
        return res.status(401).json({message:'no token provided'})
    }
    //format : bearer token
    // Bearer is just a word placed before the token in the HTTP Authorization header to label it as a token;
    // it ensures nothing and has no security role—it’s simply a label.

    const token = authHeader.split(" ")[1]
    if(!token){
        return res.status(401).json({message:'Invalid token format'})
    }

    const decode = jwt.verify(token , "MY_SECRET_ACCESS_KEY")
    //decode have user info and attached to req.user
    req.user= decode

    next()
    }
    catch(error){
        return res.status(401).json({message:'invalid or expire token'})
    }
    
}

export default authMiddleware