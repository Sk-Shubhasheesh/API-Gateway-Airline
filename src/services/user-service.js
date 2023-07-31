const { StatusCodes} = require('http-status-codes')
const { UserRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
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

}module.exports = {
    create
}