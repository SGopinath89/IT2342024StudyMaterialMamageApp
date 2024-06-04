const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const multer = require('multer');
const fs = require('fs');
const methodOverride = require('method-override');
const { UserCollection, AdminCollection, FileCollection } = require("./config");
const { name } = require('ejs');
const sessions = require('express-session');


const app = express();
const port = 8080;

app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static("./public"));
app.use(express.static("./views"));
app.use("/open",express.static('uploads'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(sessions({
    secret:'ff'
}));

app.listen(port, () => {
    console.log('Server running on port', port);
});



//file uploading part
let Storage= multer.diskStorage({
    destination : 'uploads/',
    filename : (req, file, cb) =>{
        cb(null, file.originalname)
    }
})
 

let upload = multer({
    storage : Storage
})




//Home get 

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
     res.render("login", { error: "" });
});

app.get("/signup", (req, res) => {
    res.render("signup", { error: "" });
});

app.get("/admin", (req, res) => {
    res.render("admin", { error: "" });
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error logging out");
        }
        res.redirect("/home");
    });
});


//User get

app.get("/passwordChange", (req, res) => {
    res.render("passwordChange", { error: "" });
});

app.get("/user_dashboard", (req, res) => {
    res.render("user_dashboard");
});

app.get("/user_material", (req, res) => {
    FileCollection.find({})
    .then((x) =>{
        res.render("user_material",{subject, x});
    })
    .catch((y)=>{
        console.log(y)
    })
});


//Admin get

app.get("/admin_material", (req, res) => {
   
    const subjects = req.session.selectedSubject;

    
    
    FileCollection.find({subject: req.session.selectedSubject})
    .then((x) =>{
        res.render("admin_material",{subject:subjects, x});
    })
    .catch((y)=>{
        console.log(y)
    })
});


app.get("/admin_dashboard", (req, res) => {

        res.render("admin_dashboard");
 
   
});


//Home post

app.post("/login", async (req, res) => {
    try {
        const user = await UserCollection.findOne({ name: req.body.username });
        if (!user) {
            return res.status(404).render("login", { error: "User name not found" });
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordMatch) {
            res.redirect("user_dashboard");
        } else {
            res.status(400).render("login", { error: "Wrong password" });
        }
    } catch (error) {
        res.status(500).render("login", { error: "Error occurred during login" });
    }
});

app.post("/signup", async (req, res) => {
    try {
        const confirmPassword = req.body.rePassword;
        const password = req.body.password;
        const username = req.body.username;

        const existingUser = await UserCollection.findOne({ name: username });
        if (existingUser) {
            return res.status(400).render("signup", { error: "User already exists" });
        }

        // Validation checks
        if (username.length < 3) {
            return res.status(400).render("signup", { error: "Username must be at least 3 characters long" });
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,12})/;
        if (!passwordRegex.test(password)) {
            return res.status(400).render("signup", { error: "Password must be 8 to 12 characters long, include at least one uppercase letter, and one special character" });
        }

       if (password != confirmPassword) {
            return res.status(400).render("signup", { error: "Passwords do not match" });
        }

        // Hash password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user with hashed password
        const newUser = new UserCollection({ name: username, password: hashedPassword });
        await newUser.save();
        res.status(500).render("signup", { error: "User registered successfully" });
       
    } catch (error) {
        res.status(500).render("signup", { error: "Error occurred during signup" });
    }
});

app.post("/passwordChange", async (req, res) => {
    try {
        const username = req.body.username;
        const newPassword = req.body.newpassword;
        const confirmPassword = req.body.repassword;

        // Check if the new password matches the confirm password
        if (newPassword != confirmPassword) {
            return res.status(400).render("passwordChange", { error: "Passwords do not match" });
        }

        // Here you can add further validation or checks as needed

        // Example: Update the user's password in the database
        const user = await UserCollection.findOne({ name: username });
        if (!user) {
            return res.status(404).render("passwordChange", { error: "User not found" });
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();
        res.status(500).render("passwordChange", { error: "Password changed successfully" });
        
    } catch (error) {
        res.status(500).render("passwordChange", { error: "Error occurred during password change" });
    }
});

app.post("/admin", async (req, res) => {
    try {
        const admin = await AdminCollection.findOne({ name: req.body.username });
        if (!admin) {
            return res.status(404).render("admin", { error: "Admin user name not found" });
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, admin.password);
        if (isPasswordMatch) {
            res.redirect("admin_dashboard");
        } else {
            res.status(400).render("admin", { error: "Wrong password" });
        }
    } catch (error) {
        res.status(500).render("admin", { error: "Error occurred during admin login" });
    }
});




//User post

app.post("/user_material", (req, res) => {
   
   const selectedSubject = req.body.selectedSubject.toString().replace(',', '');
    req.session.selectedSubject=selectedSubject;
    
    
    FileCollection.find({subject: req.session.selectedSubject})
    .then((x) =>{
        res.render("user_material",{subject:selectedSubject, x});
    })
    .catch((y)=>{
        console.log(y)
    })
    
    
});



//Admin post


app.post("/admin_material", (req, res) => {
    // Retrieve the selected subject value from the request body
    const selectedSubject = req.body.selectedSubject.toString().replace(',', '');
    req.session.selectedSubject = selectedSubject;
    FileCollection.find({subject: req.session.selectedSubject})
    .then((x) =>{
        res.render("admin_material",{subject:selectedSubject, x});
    })
    .catch((y)=>{
        console.log(y)
    })

});


//File Handling part

app.post("/upload",upload.single('file'),(req, res) => {
    const selectedSubject = req.session.selectedSubject;
    req.file
    FileCollection.findOne({name:req.file.filename})
    .then((a)=>{
        if(a){
        console.log("file alredy exicist");
    }
    else{
        const newfile = new FileCollection({
            subject : selectedSubject,
            name : req.file.filename
       })
       newfile.save();
        res.redirect("admin_material");
       
    }
    })
});

app.delete("/delete/:id", async (req, res) => {
    try {
        const fileName = req.params.id;
        const document = await FileCollection.deleteOne({ name: fileName });
        if (document.deletedCount === 0) {
            return res.status(404).send("File not found");
        }
        
        const filepath = 'uploads/' + fileName;
        fs.unlinkSync(filepath);
        res.redirect('/admin_material');

      
} catch (error) {
        res.status(500).send("Error occurred during file deletion");
    }
});

app.get('/open/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filepath = 'uploads/' + fileName;

    // Check if the file exists
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath);
    } else {
        res.status(404).send("File not found");
    }
});
   
   
   

