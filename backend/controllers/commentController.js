const Joi = require("joi");
const Comment = require("../models/comments");
const CommentDto = require("../DTO/CommentDto");
const MongoIdRe = /^[0-9a-fA-F]{24}$/;

const commentController = {
    async createComment(req,res,next){
        const commentSchema = Joi.object({
            content : Joi.string().required(),
            author: Joi.string().regex(MongoIdRe).required(),
            blog: Joi.string().regex(MongoIdRe).required()
        })
        const {error} = commentSchema.validate(req.body);
        if(error){
            return next(error);
        }
        const {content,author,blog} = req.body;
        try {
            const newComment = Comment({
                content,author,blog
            });
            await newComment.save();
            return res.status(201).json({message:"Comment Created"});
        } catch (error) {
            return next(error);
        }
    },
    async getComment(req,res,next){
        const commentIdSchema = Joi.object({
            id:Joi.string().regex(MongoIdRe).required()
        });
        const {error} = commentIdSchema.validate(req.params);
        if(error){
            return next(error);
        }
        const {id} = req.params;
        try {
            const comment = await Comment.find({blog:id}).populate('author');
            const commentDto = [];
            for(i=0;i<comment.length;i++)
            {
                const filterCommentData = new CommentDto(comment[i]);
                commentDto.push(filterCommentData);
            }
            return res.status(200).json({comments: commentDto});
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = commentController;