const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const { UserCollection, AdminCollection } = require("./config");

const app = express();
const port = 8080;

app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/admin", (req, res) => {
    res.render("admin");
});

app.get("/home", (req, res) => {
    res.render("home");
});

app.post("/login", async (req, res) => {
    try {
        const user = await UserCollection.findOne({ name: req.body.username });
        if (!user) {
            return res.send("User name not found");
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordMatch) {
            res.render("home");
        } else {
            res.send("Wrong password");
        }
    } catch (error) {
        res.send("Error occurred during login");
    }
});

app.post("/signup", async (req, res) => {
    try {
        const existingUser = await UserCollection.findOne({ name: req.body.username });
        if (existingUser) {
            return res.send("User already exists");
        }

        // Hash password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        // Create new user with hashed password
        const newUser = new UserCollection({ name: req.body.username, password: hashedPassword });
        await newUser.save();

        res.send("User registered successfully");
    } catch (error) {
        res.send("Error occurred during signup");
    }
});

app.post("/admin", async (req, res) => {
    try {
        const admin = await AdminCollection.findOne({ name: req.body.username });
        if (!admin) {
            return res.send("Admin user name not found");
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, admin.password);
        if (isPasswordMatch) {
            res.render("home");
        } else {
            res.send("Wrong password");
        }
    } catch (error) {
        res.send("Error occurred during admin login");
    }
});

app.listen(port, () => {
    console.log('Server running on port', port);
});
