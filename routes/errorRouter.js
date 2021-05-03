exports.notFoundPage = (req, res, next) => {
	const currentUser = req.user;
	res.render("errors/not_found.ejs", {
		title: "Page not found",
		path: null,
		user: {
			nickname: currentUser?.nickname,
			imageUrl: currentUser?.imageUrl,
			id: currentUser?._id,
		},
	});
};

exports.errorPage = (err, req, res, next) => {
	console.log(err);
	const currentUser = req.user;
	res.render("errors/error.ejs", {
		title: "Technical issue",
		path: null,
		user: {
			nickname: currentUser?.nickname,
			imageUrl: currentUser?.imageUrl,
			id: currentUser?._id,
		},
	});
};
