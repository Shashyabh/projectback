const mongoose = require('mongoose');

const UserSchema = new  mongoose.Schema({
    name : {
        type : String ,
        required : true ,
    } ,
    email : {
        type : String ,
        required : true ,
    } ,
    password : {
        type : String ,
        required : true , 
    } , 
    members : [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : 'User'
    }]
} , { timeStamps : true });

const User = new  mongoose.model("User" , UserSchema);

module.exports = {
    User 
}