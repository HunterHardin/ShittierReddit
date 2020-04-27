class ThreadsModel {
    constructor (DAO) {
        this.DAO = DAO
    }
  
    async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS threads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content Text
        )`
        return await this.DAO.run(sql)
    }

    async add (title, content) {
        return await this.DAO.run(
            'INSERT INTO threads (title, content) VALUES (?, ?)',
            [title, content]
        );
    }
    
    async getAll () {
        return await this.DAO.all(
            'SELECT title FROM threads'
        );
    }

    async getID (title) {
        const sql = `SELECT id FROM threads WHERE title=?`;
        return this.DAO.get(sql, [title]);
    }
}
  
module.exports = ThreadsModel;