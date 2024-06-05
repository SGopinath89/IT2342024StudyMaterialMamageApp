const isAuthenticated = (req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.redirect('/');
    }
};
const isAdmin = (req, res, next) => {
    if (req.session.role === 'admin') {
        next();
    } else {
        res.redirect('/');
    }
};

module.exports = {
    isAuthenticated,isAdmin
}