const intl = require("intl");
const Post = require("../models/Post");
const {getFlashMessage} = require("../utils/flashMessages");


exports.getPosts = (req, res, next) => {
	const currentUser = req.user;
	Post.find()
		.then((posts) => {
			const options = {
				year: "numeric",
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
			};
			const localLang = req.headers["accept-language"];
			posts = posts.map((post) => {
				// post.stringDate = post.createdDate.toDateString();
				post.stringDate = new intl.DateTimeFormat(localLang, options).format(
					post.createdDate
				);
				return post;
			});
			posts.reverse();
			const errorMessage = getFlashMessage(req, "error");
			return res.render("posts/all_posts.ejs", {
				title: "All posts",
				path: "/",
				posts: posts,
				errorMsg: errorMessage,
				user: {
					nickname: currentUser?.nickname,
					imageUrl: currentUser?.imageUrl,
					id: currentUser?._id,
				},
			});
		})
		.catch((err) => {
			next(err);
		});
};

exports.postPost = (req, res, next) => {
	const textBody = req.body.textBody;
	const user = req.user;
	const newPost = new Post({
		body: textBody,
		createdDate: new Date(),
		user: {
			userName: user.nickname,
			userImage: user.imageUrl,
			userId: user._id,
		},
	});
	newPost
		.save()
		.then((result) => {
			res.redirect("/");
		})
		.catch((err) => {
			next(err);
		});
};

exports.postDelete = (req, res, next) => {
	const postId = req.params.postId;
	const userId = req.body.userId;
	if (userId.toString().trim() === req.user?._id.toString()) {
		Post.findByIdAndRemove(postId)
			.then((result) => {
				return res.redirect("/");
			})
			.catch((err) => {
				next(err);
			});
	} else {
		res.redirect("/");
	}
};
