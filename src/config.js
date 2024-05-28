const mongoose = require('mongoose');

// Add options to handle deprecation warnings
const connect = mongoose.connect("mongodb://0.0.0.0/Smms", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

connect.then(() => {
    console.log("Database connected successfully");
}).catch((error) => {
    console.log("Database cannot connect", error);
});

const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const AdminLoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const FileUploadSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String, required: true }
});

const UserCollection = mongoose.model("users", LoginSchema);
const AdminCollection = mongoose.model("admins", AdminLoginSchema);
const FileCollection = mongoose.model("files", FileUploadSchema);

module.exports = {
    UserCollection,
    AdminCollection,
    FileCollection
};
