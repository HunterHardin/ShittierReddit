const express = require('express');
const app     = express();
const path    = require('path');
const createDAO   = require('./Models/dao');
const UserModel   = require('./Models/UserModel');
const ThreadsModel   = require('./Models/ThreadsModel');
const CommentsModel   = require('./Models/CommentsModel');
const AuthController = require('./Controllers/AuthController');
const winston        = require('winston');
const redis          = require('redis');
const session        = require('express-session');
const RedisStore     = require('connect-redis')(session);
const UserController = require('./Controllers/UserController');

const redisClient = redis.createClient();

const sess = session({
    store: new RedisStore({ 
        client: redisClient, // our redis client
        host: 'localhost',   // redis is running locally on our VM (we don't want anyone accessing it)
        port: 6379,          // 6379 is the default redis port (you don't have to set this unless you change port)
        ttl: 12 * 60 * 60,   // Time-To-Live (in seconds) this will expire the session in 12 hours
    }),
    secret: 'astate web-dev', // Use a random string for this in production
    resave: false, 
    cookie: {
        httpOnly: true,
    },
    saveUninitialized: false, // set this to false so we can control when the cookie is set (i.e. when the user succesfully logs in)
});

// This parses the cookie from client's request
// it parse the cookie before any routes are handled or 
// application middleware kicks in
app.use(sess);

/*
        Initialize logger
*/
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json(),
    ),
    transports: [
      new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: './logs/info.log' })
    ]
});

const dbFilePath = process.env.DB_FILE_PATH || path.join(__dirname, 'Database', 'Threads.db');
let Auth = undefined;
let Threads = undefined;
let Comments = undefined;

// Gives direct access to GET files from the
// "public" directory (you can name the directory anything)
app.use(express.static('public'));

app.use((req, res, next) => {
    logger.info(`${req.ip}|${req.method}|${req.body || ""}|${req.originalUrl}`);
    next();
});

// We need this line so express can parse the POST data the browser
// automatically sends
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const badIPS = {};

app.get('/', (req, res, next) => {
    if (!req.session.name) {
        req.session.name  = req.query.name;
    }
    req.session.views = req.session.views ? req.session.views+1 : 1;

    console.log(`current views:`);
    console.log(req.session);
    next();
});

app.use('*', (req, res, next) => {
    if (badIPS[req.ip] >= 10) {
        return res.sendStatus(403);
    }
    next();
});

app.all('/account/:userID/*', (req, res, next) => {
    console.log(req.params)
    if (req.session.isVerified && req.params.userID === req.session.userID) {
        next();
    } else {
        // Rate limiting
        badIPS[req.ip] = badIPS[req.ip] ? badIPS[req.ip]+1 : 1;
        console.log(badIPS);
        res.sendStatus(403); // HTTP 403 Forbidden
    }
});

// All information associated with a user account
app.get('/account/:userID/info', (req, res) => {
    // TODO: retrieve account information and send back to client
    res.send('info')
});

app.post('/account/:userID/passwordReset', (req, res) => {
    // TODO: update password
    res.send('reset password')
});

app.post('/account/:userID/username', (req, res) => {
    // TODO: update username
    res.send('update username')
});

app.delete('/account/:userID/user', (req, res) => {
    // TODO: delete user from db
    res.send('delete user')
});

// Default route
app.get('/', (req, res) => {
    console.log(req.ip);
    res.redirect('/home');
});

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/project.html'));
});

app.get("/logout", (req, res) => {
    req.session.isVerified = false;
    res.sendStatus(200);
});

app.get("/register", errorHandler(async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "register.html"));
}));

app.post("/register", errorHandler(async (req, res) => {
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
        if (err.code === 'SQLITE_CONSTRAINT') {
            console.error(err);
            logger.error(err);
            res.sendStatus(409); // 409 Conflict
        } else {
            throw err;
        }
    }
}));

app.get("/login", errorHandler(async (req, res) => {
    if (req.session.isVerified) {
        res.redirect("/home");
    } else {
        res.sendFile(path.join(__dirname, "public", "html", "login.html"));
    }
}));

app.post("/login", errorHandler(async (req, res) => {
    const body = req.body;
    console.log(body);
    if (body === undefined || (!body.username || !body.password)) {
        return res.sendStatus(400);
    }
    const {username, password} = body;
    const isVerified = await Auth.login(username, password);
    const status = isVerified ? 200 : 401;
    req.session.isVerified = isVerified;
    if (isVerified) {
        req.session.username = username;
        req.session.uuid = await UserController.getUserID(username);
    }
    res.sendStatus(status);
}));

app.get("/threadsHome", async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "threadsHome.html"));
});

app.get("/createThread", async (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "threadsCreation.html"));
});

app.post("/createThread", async (req, res) => {
    if (!req.session.isVerified) {
        return res.sendStatus(403);
    }
    const body = req.body;
    console.log(body);
    if (body === undefined) {
        return res.sendStatus(400);
    }
    Threads.add(body.title, body.content, req.session.username)
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

app.post("/thread", (req, res) => {
    const body = req.body;
    console.log(body.id);
    Threads.getThread(body.id)
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

app.post("/comments", (req, res) => {
    const body = req.body;
    Comments.getAllComments(body.id)
        .then( (rows) => {
            console.log(rows);
            // remember to change index.js
            res.send(JSON.stringify({comment_items: rows}));
        })
        .catch( err => {
            console.error(err);
            res.sendStatus(500);
        })
});

app.get("/threads", (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/threads.html'));
});

app.post("/createComment", async (req, res) => {
    if (!req.session.isVerified) {
        return res.sendStatus(403);
    }
    const body = req.body;
    console.log(body);
    if (body === undefined) {
        return res.sendStatus(400);
    }
    Comments.add(body.threadID, body.comment)
        .then( () => {
            res.sendStatus(200);
        }).catch( err => {
            console.error(err);
            res.sendStatus(500);
        });
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
    Comments = new CommentsModel(dao);
    await Comments.createTable();
    Users = new UserModel(dao);
    await Users.createTable();
    Auth = new AuthController(dao);
}

// This is our default error handler (the error handler must be last)
// it just logs the call stack and send back status 500
app.use(function (err, req, res, next) {
    console.error(err.stack)
    logger.error(err);
    res.redirect('/home');
});

// We just use this to catch any error in our routes so they hit our default
// error handler. We only need to wrap async functions being used in routes
function errorHandler (fn) {
    return function(req, res, next) {
      return fn(req, res, next).catch(next);
    };
};