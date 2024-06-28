
const jwt = require('jsonwebtoken');
const secretKey='phyvauac.lk@2024';

function isAuthenticated(req,res,next){
    const token =  req.session.token;
    if(!token){
        return res.status(401).json({error_messege:"need token"})
    }
     
    jwt.verify(token,secretKey,(err,decoded)=>{
        if(err){
            return res.status(401).json({error_messege:"Invalid token"})
        }
        next();
        
    })
}

function isAdmin(req,res,next){
    const token =  req.session.token;
    if(!token){
        return res.status(401).json({error_messege:"need token"})
    }
     
    jwt.verify(token,secretKey,(err,decoded)=>{
        if(err){
            return res.status(401).json({error_messege:"Invalid token"})
        }
        next();
        
    })
}

module.exports = {
    isAuthenticated,isAdmin
}