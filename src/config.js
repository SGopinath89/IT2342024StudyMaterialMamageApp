const mongoose = require('mongoose')
const connect = mongoose.connect("mongodb://0.0.0.0/Smms");

connect.then(() => {
    console.log("database connected successfully");
})
.catch(() => {
    console.log("Database cannot connect");
})

const LoginScema = new mongoose.Schema({
    name: {
        type:String,
        require:true
    },
    password: {
        type:String,
        require:true
    }
})

const collection = new mongoose.model("users",LoginScema)

module.exports = collection