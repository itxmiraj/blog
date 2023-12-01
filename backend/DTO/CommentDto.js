class CommentDto{
    constructor(comment){
        this._id = comment.id;
        this.content = comment.content;
        this.blog = comment.blog;
        this.authorName = comment.author.username;
        this.authorId = comment.author._id;
    }
}

module.exports = CommentDto;