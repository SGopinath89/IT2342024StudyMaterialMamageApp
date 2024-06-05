const express = require('express');
const admin_Router= require('../Route/admin_Router');
const user_Router= require('../Route/user_Router');

const app = express();
const port = 8080;

app.set('view engine', 'ejs');

app.use('/admin',admin_Router);
app.use('/user',user_Router);

app.use(express.json());
app.use(express.static("./public"));
app.use(express.static("./views"));




app.get("/", (req, res) => {
    res.render("home");
});


app.listen(port, () => {
    console.log('Server running on port', port);
});
