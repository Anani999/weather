const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({ 
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    accessLimit:{
        type:Number,
        default:50
    }
});

const User = mongoose.model('User',UserSchema);

module.exports = User;