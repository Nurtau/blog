require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const SessionMongo = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const app = express();
const store = new SessionMongo({
	uri: process.env.MONGODB_URI,
	collection: "sessions",
});
//importing routes
const postsRouter = require("./routes/postsRouter");
const authRouter = require("./routes/authRouter");
const errorRouter = require("./routes/errorRouter");
//importing models
const User = require("./models/User");

//settings of app
app.set("view engine", "ejs");
app.set("views", "views");
app.use(
	session({
		secret: "somethingreallylong",
		store: store,
		resave: false,
		saveUninitialized: false,
	})
);
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(csrf());
app.use(flash());

//default routes
app.use((req, res, next) => {
	res.locals.csrfToken = req.csrfToken();
	res.locals.isLoggedIn = req.session.isLoggedIn;
	next();
});

app.use((req, res, next) => {
	if (req.session.isLoggedIn) {
		return User.findById(req.session.userId)
			.then((user) => {
				req.user = user;
				return next();
			})
			.catch((err) => {
				next(err);
			});
	}
	next();
});

//assigning routes
app.use(postsRouter);
app.use(authRouter);
app.use(errorRouter.notFoundPage);
app.use(errorRouter.errorPage);

//connecting to db and starting to run a server
mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then((res) => {
		app.listen(process.env.PORT || 3000);
	})
	.catch((err) => {
		console.log(err); //change
	});
