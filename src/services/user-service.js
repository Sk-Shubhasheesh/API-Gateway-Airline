const { StatusCodes} = require('http-status-codes')
const { UserRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { Auth } = require('../utils/common');
const { response } = require('express');
const { use } = require('../routes');
const { error } = require('../utils/common/error-response');
const userRepo = new UserRepository();

async function create(data) {
    try {
        const user = await userRepo.create(data);
        return user;
    } catch (error) {
        console.log("inside service", error);
        if(error.name =='SequelizeValidationError' || error.name == 'SequelizeUniqueConstraintError') {
            let explanation = [];
            // statement is used to iterate over the array of errors returned by Sequelize during the validation process
            error.errors.forEach((err) => {
                explanation.push(err.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);

        }
        throw new AppError('Cannot create a new user object', StatusCodes.INTERNAL_SERVER_ERROR);
    }

}

async function signin(data) {
    try {
       const user = await userRepo.getUserByEmail(data.email);
       if(!user){
        throw new AppError('No user found fot the givin email', StatusCodes.NOT_FOUND);
       } 
       const passwordMatch = Auth.checkPassword(data.password,user.password); // it return promise based function true or false
       // console.log("passwordMatch", passwordMatch);
       if(!passwordMatch){
        throw new AppError('Invalid password', StatusCodes.BAD_REQUEST);
       }
       const jwt = Auth.createToken({id: user.id, email: user.email});
       return jwt;
    } catch (error) {
        if(error instanceof AppError) throw error;
        console.log(error);
        throw new AppError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR); 
    }
}

async function isAuthenticated(token){
    try {
        if(!token){
            throw new AppError("Missing JWT token", StatusCodes.BAD_REQUEST); 
    }
    const response = Auth.verifyToken(token);
    const user = await userRepo.get(response.id);
    if(!user){
        throw new AppError("No user found", StatusCodes.NOT_FOUND); 
    }  
    return user.id;  
 } catch (error) {
        if(error instanceof AppError) throw error;
        if(error.name == 'JsonWebTokenError'){
            throw new AppError("Invalid JWT token", StatusCodes.BAD_REQUEST); 
        }
    }
    console.log(error);
    throw new AppError("Something went wrong", StatusCodes.INTERNAL_SERVER_ERROR); 
    
}




module.exports = {
    create,
    signin,
    isAuthenticated
}