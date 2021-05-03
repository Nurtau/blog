const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
	body: {
		type: String,
		required: true
	},
	createdDate: {
		type: Date,
		required: true
	},
	user: {
		userName: {
			type: String,
			required: true,
		},
		userImage: {
			type: String,
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectID,
			required: true,
			ref: "User"
		}
	}
});

module.exports = mongoose.model("Post", PostSchema);