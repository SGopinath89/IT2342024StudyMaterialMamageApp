const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')

const app = express()
const port = 8080

app.use(express.json())
app.set('view engine','ejs')
app.use(express.static("./public"))

app.get("/",(req,res) => {
    res.render("home");
})

app.get("/login",(req,res) => {
    res.render("login");
})

app.get("/signup",(req,res) => {
    res.render("signup");
})

app.get("/admin",(req,res) => {
    res.render("admin");
})

app.listen(port,() =>{
    console.log('server run on port ',port);
})