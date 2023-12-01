const express = require("express");
const authController = require("../controllers/authController");
const blogController = require("../controllers/blogController");
const commentController = require("../controllers/commentController");
const auth = require("../midllewares/auth");
const router = express.Router();

router.get("/", (req,res)=>{
    res.json({mssge:"Hello from router"});
})

router.post("/register",authController.register);
router.post("/login",authController.login)
router.post("/logout",auth,authController.logout);
router.get("/refresh",authController.refresh);
router.post("/blog",auth,blogController.createBlog);
router.get("/blog/all",auth,blogController.readAllBlog);
router.get("/blog/:id",auth,blogController.readOneBlog);
router.put("/blog",auth,blogController.updateBlog);
router.delete("/blog/:id",auth,blogController.deleteBlog);
router.post("/comment",auth,commentController.createComment);
router.get("/comment/:id",auth,commentController.getComment);

module.exports = router;