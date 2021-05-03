const bcrypt = require("bcrypt");
const crypto = require("crypto");
const cartoonAvatar = require("cartoon-avatar");
const User = require("../models/User");
const sendMail = require("../utils/emailSender");
const {
	getFlashMessage,
	getValidationResult,
} = require("../utils/flashMessages");

//function to re-render login page with given values
const reRenderLogin = ({
	req,
	res,
	errorMessage,
	successMessage,
	email,
	password,
}) => {
	req.flash("error", "The email or password is incorrect");
	return res.render("auth/login.ejs", {
		title: "Login page",
		path: "/login",
		errorMsg: errorMessage,
		successMsg: successMessage,
		body: {
			email,
			password,
		},
	});
};

//login
exports.getLogin = (req, res, next) => {
	const errorMessage = getFlashMessage(req, "error");
	const successMessage = getFlashMessage(req, "success");
	res.render("auth/login.ejs", {
		title: "Login page",
		path: "/login",
		errorMsg: errorMessage,
		successMsg: successMessage,
		body: undefined,
	});
};

exports.postLogin = (req, res, next) => {
	const errorMessage = getFlashMessage(req, "error");
	const successMessage = getFlashMessage(req, "success");
	const email = req.body.email;
	const password = req.body.password;
	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				return reRenderLogin({
					req,
					res,
					errorMessage,
					successMessage,
					email,
					password,
				});
			}
			bcrypt
				.compare(password, user.password)
				.then((isSame) => {
					if (isSame) {
						req.session.isLoggedIn = true;
						req.session.userId = user._id;
						req.session.save((err) => {
							if (err) {
								next(err);
							} else {
								return res.redirect("/");
							}
						});
					} else {
						return reRenderLogin({
							req,
							res,
							errorMessage,
							successMessage,
							email,
							password,
						});
					}
				})
				.catch((err) => {
					next(err);
				});
		})
		.catch((err) => {
			next(err);
		});
};

//signup
exports.getSignup = (req, res, next) => {
	const errorMessage = getFlashMessage(req, "error");
	res.render("auth/signup.ejs", {
		title: "Signup page",
		path: "/signup",
		errorMsg: errorMessage,
		body: undefined,
	});
};

exports.postSignup = (req, res, next) => {
	const nickname = req.body.nickname;
	const email = req.body.email;
	const password = req.body.password;
	const confirmPassword = req.body.confirmPassword;
	const validationErr = getValidationResult(req);
	if (validationErr) {
		return res.render("auth/signup.ejs", {
			title: "Signup page",
			path: "/signup",
			errorMsg: validationErr,
			body: {
				nickname,
				email,
				password,
				confirmPassword,
			},
		});
	}

	bcrypt
		.hash(password, 12)
		.then((hashedPassword) => {
			const newUser = new User({
				nickname: nickname,
				imageUrl: cartoonAvatar.generate_avatar(),
				email: email,
				password: hashedPassword,
			});
			return newUser.save();
		})
		.then((result) => {
			req.flash("success", "You have successfully signed up");
			res.redirect("/login");
		})
		.catch((err) => {
			next(err);
		});
};

//reset
exports.getReset = (req, res, next) => {
	const errorMessage = getFlashMessage(req, "error");
	const successMessage = getFlashMessage(req, "success");
	res.render("auth/reset.ejs", {
		email: null,
		title: "Forgot password",
		path: null,
		errorMsg: errorMessage,
		successMsg: successMessage,
	});
};

exports.postSendLink = (req, res, next) => {
	const email = req.body.email;
	User.findOne({ email: email })
		.then((user) => {
			if (!user) {
				return res.render("auth/reset.ejs", {
					email: email,
					title: "Forgot password",
					path: null,
					errorMsg: "There is no such registered email",
					successMsg: null,
				});
			}
			crypto.randomBytes(12, (err, buf) => {
				if (err) {
					return next(err);
				}
				const token = buf.toString("hex");
				user.resetToken = token;
				user.resetTokenExpiration = Date.now() + 3600 * 1000;
				user
					.save()
					.then((result) => {
						sendMail(req, res, { email, nickname: user.nickname, token });
					})
					.catch((err) => {
						return next(err);
					});
			});
		})
		.catch((err) => {
			next(err);
		});
};

exports.getChangePassword = (req, res, next) => {
	const token = req.params.resetToken;
	User.findOne({
		resetToken: token,
		resetTokenExpiration: {
			$gt: Date.now(),
		},
	})
		.then((user) => {
			if (!user) {
				req.flash("error", "The link expired");
				return res.redirect("/reset");
			}
			const errorMessage = getFlashMessage(req, "error");

			res.render("auth/new_password.ejs", {
				title: "New password",
				path: null,
				errorMsg: errorMessage,
				body: null,
				userId: user._id,
				token: token,
			});
		})
		.catch((err) => {
			next(err);
		});
};

exports.postChangePassword = (req, res, next) => {
	const userId = req.body.userId;
	const resetToken = req.body.token;
	const password = req.body.password;
	const confirmPassword = req.body.confirmPassword;
	const validationErr = getValidationResult(req);
	if (validationErr) {
		return res.render("auth/new_password.ejs", {
			title: "New password",
			path: null,
			errorMsg: validationErr,
			body: {
				password,
				confirmPassword,
			},
			userId: userId,
			token: resetToken,
		});
	}

	User.findOne({
		_id: userId,
		resetToken: resetToken,
		resetTokenExpiration: {
			$gt: Date.now(),
		},
	})
		.then((user) => {
			if (!user) {
				req.flash("error", "The link expired");
				return res.redirect("/reset");
			}
			bcrypt
				.hash(password, 12)
				.then((hashedPassword) => {
					user.password = hashedPassword;
					user.resetToken = null;
					user.resetTokenExpiration = null;
					return user.save();
				})
				.then((result) => {
					req.flash("success", "The password succesfully changed");
					res.redirect("/login");
				})
				.catch((err) => {
					next(err);
				});
		})
		.catch((err) => {
			next(err);
		});
};

//logout
exports.postLogout = (req, res, next) => {
	req.session.destroy((err) => {
		if (err) {
			req.flash("error", "Please try again to logout");
		}
		res.redirect("/");
	});
};
