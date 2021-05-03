const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: process.env.SENDER_EMAIL_SERVICE,
	auth: {
		user: process.env.SENDER_EMAIL,
		pass: process.env.SENDER_PASSWORD,
	},
});

module.exports = (req, res, { email, nickname, token }) => {
	const options = {
		from: process.env.SENDER_EMAIL,
		to: email,
		subject: "Password reset link",
		// text: "cool"
		html: `<h5>Hello, ${nickname}</h5>
			<p>If you want to reset password, then click <a href="http://localhost:3000/reset/${token}">here</a></br>After one hour the link will expire.</p>`,
	};
	transporter.sendMail(options, (err, info) => {
		if (err) {
			console.log(err);
			req.flash("error", "Error occured. Please try again");
			return res.redirect("/reset");
		}
		req.flash("success", "The link successfully sent");
		res.redirect("/reset");
	});
};