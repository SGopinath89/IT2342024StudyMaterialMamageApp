const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const multer = require('multer');
const { UserCollection, AdminCollection, FileCollection } = require("./config");

const app = express();
const port = 8080;

app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
    console.log('Server running on port', port);
});



//File upload

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });



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


//User get

app.get("/passwordChange", (req, res) => {
    res.render("passwordChange", { error: "" });
});

app.get("/user_dashboard", (req, res) => {
    res.render("user_dashboard");
});

app.get("/user_material", (req, res) => {
    res.render("user_material");
});


//Admin get

app.get("/admin_material", (req, res) => {
    const subject = req.body.subject; // Assuming you're passing the subject from somewhere
    res.render("admin_material", { subject, message: "", error: "" });
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

        res.status(201).send("User registered successfully");
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

        res.status(200).send("Password changed successfully");
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


//Admin post

app.post("/admin_material", upload.single('file'), async (req, res) => {
    try {
        const subject = req.body.subject;
        const file = req.file;

        if (!file) {
            return res.status(400).render("admin_material", { subject, error: "No file uploaded" });
        }

        const newFile = new FileCollection({
            subject: subject,
            fileName: file.filename,
            filePath: file.path,
            fileType: file.mimetype
        });

        await newFile.save();

        res.render("admin_material", { subject, message: "File uploaded successfully" });
    } catch (error) {
        res.status(500).render("admin_material", { subject, error: "Error occurred during file upload" });
    }
});


//User post

app.post("/user_material", (req, res) => {
    // Retrieve the selected subject value from the request body
    const selectedSubject = req.body.selectedSubject.toString().replace(',', '');
    
    // Render the admin_material view and pass the selected subject value
    res.render("user_material", { subject: selectedSubject });
});

 

