class CommentsModel {
    constructor (DAO) {
        this.DAO = DAO
    }

    async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS comments (
            commentID INTEGER,
            comment TEXT
        )`
        return await this.DAO.run(sql)
    }

    async add (id, comment) {
        return await this.DAO.run (
            'INSERT INTO comments (commentID, comment) VALUES (?,?)',
            [id, comment]
        );
    }

    async getAllComments (id) {
        return await this.DAO.all(
            'SELECT commentID, comment FROM comments WHERE commentID=?',
            [id]
        );
    }

}
 
module.exports = CommentsModel;