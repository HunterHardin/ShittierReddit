class ThreadsModel {
    constructor (DAO) {
        this.DAO = DAO
    }
  
    async createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS threads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT
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
            'SELECT title, id, content FROM threads'
        );
    }

    async getThread(id) {
        return await this.DAO.get(
            'SELECT title, content FROM threads WHERE id=?',
            [id]
        );
    }

}
 
module.exports = ThreadsModel;