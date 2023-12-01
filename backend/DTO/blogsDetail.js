class BlogDetails {
    constructor(blog){
        this._id = blog._id;
        this.title = blog.title;
        this.content = blog.content;
        this.photo = blog.photoPath;
        this.createdAt = blog.createdAt;
        this.authorName = blog.author.name;
        this.authorId = blog.author._id;
    }
}

module.exports = BlogDetails;