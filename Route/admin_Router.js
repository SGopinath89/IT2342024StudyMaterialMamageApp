const express = require('express')
const router= express.Router()
const {isAuthenticated,isAdmin} = require('../Middleware/Authontication'); 
const { UserCollection, AdminCollection, FileCollection } = require("../src/config");
const bcrypt = require("bcrypt");
const multer = require('multer');
const fs = require('fs');
const sessions = require('express-session');
const methodOverride = require('method-override');


router.use(express.urlencoded({ extended: false }));
router.use(methodOverride('_method'));
router.use("/open",express.static('uploads'));
router.use(sessions({
    secret:'adadsacafsdfbjkdsgfj'
}));


// FILE UPLOAD

let Storage= multer.diskStorage({
    destination : 'uploads/',
    filename : (req, file, cb) =>{
        cb(null, file.originalname)
    }
})
 let upload = multer({
    storage : Storage
})


// GET

router.get("/login", (req, res) => {
    res.render("admin", { error: "" });
});

router.post("/login", async (req, res) => {
    try {
        const admin = await AdminCollection.findOne({ name: req.body.username });
        if (!admin) {
            return res.status(404).render("admin", { error: "Admin user name not found" });
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, admin.password);
        if (isPasswordMatch) {
           req.session.username=admin.name;
           req.session.role = 'admin';
            res.redirect("admin_dashboard");
        } else {
            res.status(400).render("admin", { error: "Wrong password" });
        }
    } catch (error) {
        res.status(500).render("admin", { error: "Error occurred during admin login" });
        console.log(error);
    }
});

router.get("/admin_material",isAdmin, (req, res) => {
   
    const subjects = req.session.selectedSubject;

    
    
    FileCollection.find({subject: req.session.selectedSubject})
    .then((x) =>{
        res.render("admin_material",{subject:subjects, x , error: ""});
    })
    .catch((y)=>{
        console.log(y)
    })
});

router.get("/admin_dashboard",isAdmin, (req, res) => {

        res.render("admin_dashboard");
 
   
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
        res.redirect("/admin/login");
    });
});


// POST

router.post("/admin_material",isAdmin, (req, res) => {
    // Retrieve the selected subject value from the request body
    const selectedSubject = req.body.selectedSubject.toString().replace(',', '');
    req.session.selectedSubject = selectedSubject;
    FileCollection.find({subject: req.session.selectedSubject})
    .then((x) =>{
        res.render("admin_material",{subject:selectedSubject, x, error: ""});
    })
    .catch((y)=>{
        console.log(y)
    })

});

router.post("/upload",isAdmin,upload.single('file'),(req, res) => {
    const selectedSubject = req.session.selectedSubject;
   
    req.file
    FileCollection.findOne({name:req.file.filename})
    .then((a)=>{
        if(a){
            FileCollection.find({subject: req.session.selectedSubject})
            .then((x) =>{
                res.render("admin_material",{subject:selectedSubject, x, error: "file alredy exicist"});
            })
            .catch((y)=>{
                console.log(y)
            })
       
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

router.delete("/delete/:id",isAdmin, async (req, res) => {
    try {
        const fileName = req.params.id;
        const document = await FileCollection.deleteOne({ name: fileName });
        if (document.deletedCount === 0) {
            return res.status(404).send("File not found");
        }
        
        const filepath = 'uploads/' + fileName;
        fs.unlinkSync(filepath);
        res.redirect('/admin/admin_material');

      
} catch (error) {
        res.status(500).send("Error occurred during file deletion");
    }
});





module.exports = router;