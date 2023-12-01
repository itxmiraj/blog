class DTO{
    constructor(emailMatch)
    {
        this._id = emailMatch._id;
        this.username = emailMatch.username;
        this.name = emailMatch.name;
    }
}

module.exports = DTO;