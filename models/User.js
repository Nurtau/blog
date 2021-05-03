const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	nickname: {
		type: String,
		required: true,
	},
	imageUrl: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	resetToken: String,
	resetTokenExpiration: Date,
});

module.exports = mongoose.model("User", UserSchema);
