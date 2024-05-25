const express = require('express')
const path = require("path")
const bcrypt = require("bcrypt")
const collection = require("./config")
const collection2 = require("./config2")




const app = express()
const port = 8080

app.use(express.json())
app.set('view engine','ejs')
app.use(express.static("./public"))
app.use(express.urlencoded({extended: false}))



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



app.get("/home",(req,res) => {
    res.render("home");
})



app.post("/login", async (req,res) => {
   try{
        const check =await collection.findOne({name: req.body.username});
        if(!check){
            res.send("user name cannot find");
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password,check.password);
        if(isPasswordMatch){
            res.render("home");
        }
        else{
            res.send("wrong password");
        }
   }
   catch{
    res.send("wrong detail");
   }

})



app.post("/signup", async (req,res) => {
    const data = {
       name: req.body.username,
       password: req.body.password
    }
    const existinguser = await collection2.findOne({name: data.name});
    if(existinguser){
        res.send("user alredy exist");
    }
    else{
        //hash password using bcrypt
        const saltRounds = 10;// no of salt round for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;
        const userdata = await collection2.insertMany(data);
        console.log(userdata);
    }
})

app.post("/admin", async (req,res) => {
    try{
         const check =await collection2.findOne({name: req.body.username});
         if(!check){
             res.send("user name cannot find");
         }
 
         const isPasswordMatch = await bcrypt.compare(req.body.password,check.password);
         if(isPasswordMatch){
             res.render("home");
         }
         else{
             res.send("wrong password");
         }
    }
    catch{
     res.send("wrong detail");
    }
 
 })

app.listen(port,() =>{
    console.log('server run on port ',port);
})