const express = require('express');
const app     = express();
const path    = require('path');
const createDAO   = require('./Models/dao');
const UserModel   = require('./Models/UserModel');
const ThreadsModel   = require('./Models/ThreadsModel');
const AuthController = require('./Controllers/AuthController');

const dbFilePath = process.env.DB_FILE_PATH || path.join(__dirname, 'Database', 'Threads.db');
let Auth = undefined;
let Threads = undefined;

// Gives direct access to GET files from the
// "public" directory (you can name the directory anything)
app.use(express.static('public'));

// We need this line so express can parse the POST data the browser
// automatically sends
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Default route
app.get('/', (req, res) => {
    console.log(req.ip);
    res.redirect('/home');
});

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/project.html'));
});

app.get("/register", async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "register.html"));
});

app.post("/register", async (req, res) => {
    const body = req.body;
    console.log(body);
    if (body === undefined || (!body.username || !body.password)) {
        return res.sendStatus(400);
    }
    const {username, password} = body;
    try {
        await Auth.register(username, password);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.get("/login", async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "login.html"));
});

app.post("/login", async (req, res) => {
    const body = req.body;
    console.log(body);
    if (body === undefined || (!body.username || !body.password)) {
        return res.sendStatus(400);
    }
    const {username, password} = body;
    try {
        if( await Auth.login(username, password)) {
            res.sendStatus(200);
        }
        else
            res.sendStatus(401);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.get("/threadsHome", async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "threadsHome.html"));
});

app.get("/createThread", async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "threadsCreation.html"));
});

app.post("/createThread", async (req, res) => {
    const body = req.body;
    console.log(body);
    if (body === undefined) {
        return res.sendStatus(400);
    }
    Threads.add(body.title, body.content)
        .then( () => {
            res.sendStatus(200);
        }).catch( err => {
            console.error(err);
            res.sendStatus(500);
        });
});

app.get("/thread_items", (req, res) => {
    Threads.getAll()
        .then( (rows) => {
            console.log(rows);
            // remember to change index.js
            res.send(JSON.stringify({thread_items: rows}));
        })
        .catch( err => {
            console.error(err);
            res.sendStatus(500);
        })
});


// Listen on port 80 (Default HTTP port)
app.listen(80, async () => {
    // wait until the db is initialized and all models are initialized
    await initDB();
    // Then log that the we're listening on port 80
    console.log("Listening on port 80.");
});

async function initDB () {
    const dao = await createDAO(dbFilePath);
    Threads = new ThreadsModel(dao);
    await Threads.createTable();
    Users = new UserModel(dao);
    await Users.createTable();
    Auth = new AuthController(dao);
}