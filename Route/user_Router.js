const express = require('express');
const router = express.Router();
const {isAuthenticated,isAdmin} = require('../Middleware/Authontication'); 
const { UserCollection, AdminCollection, FileCollection } = require("../src/config");
const bcrypt = require("bcrypt");

const sessions = require('express-session');


router.use(express.urlencoded({ extended: false }));

router.use("/open",express.static('uploads'));
router.use(sessions({
    secret:'adadsacafsdfbjkdsgfj'
}));



// GET

router.get("/login", (req, res) => {
    res.render("login", { error: "" });
});

router.get("/signup", (req, res) => {
   res.render("signup", { error: "" });
});

router.get("/passwordChange", (req, res) => {
   res.render("passwordChange", { error: "" });
});

router.get("/user_dashboard", isAuthenticated,  (req, res) => {
   res.render("user_dashboard");
});

router.get("/user_material", isAuthenticated, (req, res) => {
   FileCollection.find({})
   .then((x) =>{
       res.render("user_material",{subject, x});
   })
   .catch((y)=>{
       console.log(y)
   })
});

router.post("/user_material",isAuthenticated, (req, res) => {
  
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

router.get('/open/:fileName',isAuthenticated, (req, res) => {
    const fileName = req.params.fileName;
    const filepath = 'uploads/' + fileName;

    // Check if the file exists
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath);
    } else {
        res.status(404).send("File not found");
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error logging out");
        }
        res.redirect("/user/login");
    });
});





// POST

router.post("/login", async (req, res) => {
   try {
       const user = await UserCollection.findOne({ name: req.body.username });
       if (!user) {
           return res.status(404).render("login", { error: "User name not found" });
       }

       const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
       if (isPasswordMatch) {
           req.session.username = user.name;
           res.redirect("user_dashboard");
       } else {
           res.status(400).render("login", { error: "Wrong password" });
       }
   } catch (error) {
       res.status(500).render("login", { error: "Error occurred during login" });
   }
});

router.post("/signup", async (req, res) => {
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

router.post("/passwordChange", async (req, res) => {
   try {
       const username = req.body.username;
       const newPassword = req.body.newpassword;
       const confirmPassword = req.body.repassword;

    

       // Here you can add further validation or checks as needed

       // Example: Update the user's password in the database
       const user = await UserCollection.findOne({ name: username });
       if (!user) {
           return res.status(404).render("passwordChange", { error: "User not found" });
       }

         // Check if the new password matches the confirm password
         if (newPassword != confirmPassword) {
            return res.status(400).render("passwordChange", { error: "Passwords do not match" });
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





module.exports = router;