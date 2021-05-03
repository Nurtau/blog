exports.isLoggedIn = (req, res, next) => {
	if (req.session.isLoggedIn) {
		return next();
	}
	req.flash("error", "You have to be logged in");
	res.redirect("/");
}


exports.isLoggedOut = (req, res, next) => {
	if (!req.session.isLoggedIn) {
		return next();
	}
	req.flash("error", "To proceed you have to be logged out");
	res.redirect("/");
}