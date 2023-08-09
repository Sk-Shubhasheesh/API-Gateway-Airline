const { StatusCodes } = require('http-status-codes');
const { UserService} = require('../services')
const { ErrorResponce } = require('../utils/common');
const AppError = require('../utils/errors/app-error');
const { message } = require('../utils/common/error-response');

function validateAuthRequest(req, res, next){
    if(!req.body.email){
        ErrorResponce.message = 'Something went wrong while authenticating user';
        ErrorResponce.error = new AppError(['Email not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                 .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponce);
          
    }
    if(!req.body.password){
        ErrorResponce.message = 'Something went wrong while authenticating user';
        ErrorResponce.error = new AppError(['password not found in the incoming request in the correct form'], StatusCodes.BAD_REQUEST);
        return res
                 .status(StatusCodes.BAD_REQUEST)
                .json(ErrorResponce);
          
    }
    next();
}

async function checkAuth(req, res, next){
    try {
        const response = await UserService.isAuthenticated(req.headers['x-access-token']);
        if(response){
            req.user = response; // setting user id in the req object
            next();
        }
    } catch (error) {
        return res
                 .status(error.statusCode)
                .json(error);
    }
   

}

async function isAdmin(req, res, next){
    const response = await UserService.isAdmin(req.user);
    if(!response){
        return res
                 .status(StatusCodes.UNAUTHORIZED)
                 .json({message: 'User not authorized for this action'}); 
    }
    next();
}

module.exports = {
    validateAuthRequest,
    checkAuth,
    isAdmin
}