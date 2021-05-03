const express = require('express');
const router = express.Router();
const postsController = require("../controllers/postsController");
const {isLoggedIn} = require("../middlewares/authCheck");

//showing posts
router.get("/", postsController.getPosts);

//creating post
router.post("/send", isLoggedIn, postsController.postPost);

//deleting post
router.post("/delete/:postId", isLoggedIn, postsController.postDelete);


module.exports = router;
