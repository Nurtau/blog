const express = require("express");
const { body } = require("express-validator/check");
const authController = require("../controllers/authController");
const { isLoggedIn, isLoggedOut } = require("../middlewares/authCheck");
const User = require("../models/User");

const router = express.Router();

//signup
router.get("/signup", isLoggedOut, authController.getSignup);
router.post(
	"/signup",
	isLoggedOut,
	[
		body("nickname")
			.isLength({ min: 4, max: 16 })
			.withMessage("The nickname have to contain 4-16 characters")
			.custom((val) => {
				return User.findOne({ nickname: val }).then((user) => {
					if (user) {
						return Promise.reject("Please choose another nickname");
					}
				});
			}),
		body("email")
			.isEmail()
			.withMessage("Please write a proper email")
			.custom((val) => {
				return User.findOne({ email: val }).then((user) => {
					if (user) {
						return Promise.reject("Such email already exists");
					}
				});
			}),
		body("password")
			.isLength({ min: 6, max: 16 })
			.withMessage("The password have to contain 6-16 characters"),
		body("confirmPassword").custom((val, { req }) => {
			if (val !== req.body.password) {
				throw new Error("Passwords have to match");
			}
			return true;
		}),
	],
	authController.postSignup
);

//login
router.get("/login", isLoggedOut, authController.getLogin);
router.post("/login", isLoggedOut, authController.postLogin);

//reset
router.get("/reset", authController.getReset);
router.post("/reset", authController.postSendLink);
router.get("/reset/:resetToken", authController.getChangePassword);
router.post(
	"/reset/change",
	isLoggedOut,
	[
		body("password")
			.isLength({ min: 6, max: 16 })
			.withMessage("The password have to contain 6-16 characters"),
		body("confirmPassword").custom((val, { req }) => {
			if (val !== req.body.password) {
				throw new Error("Passwords have to match");
			}
			return true;
		}),
	],
	authController.postChangePassword
);

//logout
router.post("/logout", isLoggedIn, authController.postLogout);

module.exports = router;
