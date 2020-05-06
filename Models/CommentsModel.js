class CommentsModel {
    constructor (DAO) {
        this.DAO = DAO
    }

    async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS comments (
            commentID INTEGER,
            comment TEXT,
            username TEXT
        )`
        return await this.DAO.run(sql)
    }

    async add (id, comment, username) {
        return await this.DAO.run (
            'INSERT INTO comments (commentID, comment, username) VALUES (?,?,?)',
            [id, comment, username]
        );
    }

    async getAllComments (id) {
        return await this.DAO.all(
            'SELECT commentID, comment, username FROM comments WHERE commentID=?',
            [id]
        );
    }

}
 
module.exports = CommentsModel;