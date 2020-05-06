class ThreadsModel {
    constructor (DAO) {
        this.DAO = DAO
    }
  
    async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS threads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            username TEXT
        )`
        return await this.DAO.run(sql)
    }

    async add (title, content, username) {
        return await this.DAO.run(
            'INSERT INTO threads (title, content, username) VALUES (?, ?, ?)',
            [title, content, username]
        );
    }
    
    async getAll () {
        return await this.DAO.all(
            'SELECT title, id, content, username FROM threads'
        );
    }

    async getThread(id) {
        return await this.DAO.get(
            'SELECT title, content, username FROM threads WHERE id=?',
            [id]
        );
    }

}
 
module.exports = ThreadsModel;