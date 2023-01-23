const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('books');
                return userData;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    },
Mutation:{
    addUser: async (parent, args) =>{
        try {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        }catch(err){
            console.log(err);
        }
    },
    login: async (parent, { email, password }) =>{
        const user = await User.findOne({email});
        if(!user){
            throw new AuthenticationError('No user found with this email address!');
        }
        const correctPw = await user.isCorrectPassword(password);
        if(!correctPw){
            throw new AuthenticationError('Incorrect credentials');
        }
        const token = signToken(user);
        return { token, user };
    },
    saveBook: async (parent, {input}, context) =>{
        if(context.user){
            const updatedUser = await User.findOneAndUpdate(
                {_id: context.user._id},
                {$addToSet: {savedBooks: input}},
                {new: true, runValidators: true}
            ).populate("savedBooks");
            return updatedUser;
        }
        throw new error('Could not add book!');
    },
    removeBook: async (parent, {bookId}, context) => {
        if(context.user){
            const updatedUser = await User.findOneAndUpdate(
                {_id: context.user._id},
                {$pull: {savedBooks: {bookId: bookId}}},
                {new: true}
            ).populate("savedBooks");
            return updatedUser;
        }
        throw new AuthenticationError('Could not delete book!')

    }
}

}