const Joi = require("joi");
const fs = require('fs');
const Blog = require("../models/blogs");
const BlogDTO = require("../DTO/blogDto");
const BlogDetails = require("../DTO/blogsDetail");
const Comment = require("../models/comments");
const { BACKEND_SERVER_HOST } = require("../config/config");

// const BACKEND_SERVER_HOST = ' http://localhost:5000'

const MongoIdRe = /^[0-9a-fA-F]{24}$/;
const blogController = {
    async createBlog(req, res, next) {
        // validate req body so that it matches blog model
        const blogSchema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            author: Joi.string().regex(MongoIdRe).required(),
            photo: Joi.string().required(),
        });

        const { error } = blogSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        const { title, content, author, photo } = req.body;

        // Decode base64-encoded image data
        const decodedImage = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

        // Allocate a random name to the image
        const imagePath = `${Date.now()}-${author}.png`;

        // Save the image locally
        try {
            fs.writeFileSync(`./localStorage/${imagePath}`, decodedImage);
        } catch (error) {
            return next(error);
        }

        // Save in the database
        try {
            // console.log(BACKEND_SERVER_HOST);
            const newBlog = new Blog({
                title,
                author,
                content,
                photoPath: `${BACKEND_SERVER_HOST}/localStorage/${imagePath}`,
            });
            // Convert the newBlog instance to a plain JavaScript object
            const blogObject = newBlog.toObject();

            // Save the plain JavaScript object to the database
            await Blog.create(blogObject);

            const blogDto = new BlogDTO(newBlog);

            return res.status(201).json({ blog: blogDto });
        } catch (error) {
            return next(error);
        }
    },

    // select all blogs
    async readAllBlog(req, res, next) {
        try {
            const blogsObj = await Blog.find({});
            const blogsDto = [];
            for (let i = 0; i < blogsObj.length; i++) {
                Dto = new BlogDTO(blogsObj[i]);
                blogsDto.push(Dto)
            }
            return res.status(200).json({ blogs: blogsDto });
        } catch (error) {
            return next(error);
        }
    },

    // select blog by id
    async readOneBlog(req, res, next) {
        const blogSchema = Joi.object({
            id: Joi.string().regex(MongoIdRe).required()
        })
        const { error } = blogSchema.validate(req.params);
        if (error) {
            let error = {
                status: 401,
                message: "Unauthorized"
            }
            return next(error);
        }
        const { id } = req.params;
        try {
            const blog = await Blog.findOne({ _id: id }).populate('author');
            const blogDto = new BlogDetails(blog);
            res.status(200).json({ blog: blogDto });
        } catch (error) {
            return next(error);
        }
    },
    async updateBlog(req, res, next) {
        const updateBlogSchema = Joi.object({
            title: Joi.string().required(),
            content: Joi.string().required(),
            author: Joi.string().regex(MongoIdRe).required(),
            blogId: Joi.string().regex(MongoIdRe).required(),
            photo: Joi.string()
        });
        const { error } = updateBlogSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        const { title, content, author, blogId, photo } = req.body;
        let blog;
        try {
            blog = await Blog.findOne({ _id: blogId });
        } catch (error) {
            return next(error);
        }
        // console.log(blog);
        console.log(photo);
        if (photo) {
           
            try {
                let previousPhoto = blog.photoPath;
                // split backend name and storage name and get last index
                const fileName = previousPhoto.split('/').pop();
                console.log(fileName);
                // delete from local
                fs.unlinkSync(`localStorage/${fileName}`);
                // buffer new photo to decode 64 base string
                const decodedImage = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''),
                    'base64');
                // Allocate random name to image
                const imagePath = `${Date.now()}-${author}.png`;
                // Save new photo locally
                fs.writeFileSync(`./localStorage/${imagePath}`, decodedImage);
                // Save in db
                await Blog.updateOne({_id: blogId},{
                    title,
                    content,
                    author,
                    photoPath: `${BACKEND_SERVER_HOST}/localStorage/${imagePath}`
                });
              return  res.status(200).json({message: "Blog Updated"});
            } catch (error) {
                return next(error);
            }



        }
        else {
            console.log(blog);
            try {
                await Blog.updateOne({_id: blogId},{
                    title,
                    content,
                    author
                });
              return  res.status(200).json({message: "Blog Updated"});
            } catch (error) {
                return next(error);
            }
        }
    },
    async deleteBlog(req,res,next){
        try {
            const blogIdSchema = Joi.object({
                id: Joi.string().regex(MongoIdRe).required()
            })
            const {error} = blogIdSchema.validate(req.params);
            if(error){
                return next(error);
            }
            const {id} = req.params; 
            await Blog.deleteOne({_id: id });
            await Comment.deleteMany({blog: id});
            return res.status(200).json({message:"Blog Deleted"});
        } catch (error) {
            return next(error);
        }
    }
};

module.exports = blogController;
