const express = require('express');
const path = require('path');
const pug = require('pug');
const session = require('express-session');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('dwndb.db');

const port = 5000

const app = express()


app.use(express.urlencoded({ extended: false }))

//app.use('trust proxy', 1)
app.use(session({
    secret: 'cringe ass secret',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true}
}))

var sess;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.render('index.pug')
    console.log('someone is on index')

    try {
        if(sess.uid != null) {
            console.log('logged in and id is '+sess.uid+' and username is '+sess.username+' session id: '+sess.sessid)
        }
    }
    catch {
        console.log('no session found')
    }

});

//------------------------------------------------------------
// todo:
// session working for everyone...
//------------------------------------------------------------

app.get('/downloads', (req, res) => {
    db.get('SELECT * FROM downloadTbl;', [req.body.username, req.body.password], (err, row) => {
        if(err) {
            throw err
        }

        if(row != null) {
            res.render('downloads.pug', {
                n:row.pid, 
                preview:'Shaggy_zoinks_face.jpg',
            })
        }

        else {
            res.send('not logged in')
        }

    })

    console.log('someone is on downloads')
});

app.get('/login', (req, res) => {
    res.render('login.pug')
    console.log('someone is on login')
})

app.post('/login', (req, res) => {

    
    //const stmt = db.prepare('SELECT * FROM userTbl WHERE username = ? AND password = ?');

    db.get('SELECT * FROM userTbl WHERE username = ? AND password = ?;', [req.body.username, req.body.password], (err, row) => {
        if(err) {
            throw err
        }

        if(row != null) {
            res.send('logged in')
            //console.log(row.uid);
            sess = req.session;
            sess.sessid = req.sessionID;
            sess.uid = row.uid;
            sess.username = row.username;
            console.log('logged in and id is '+sess.uid+' and username is '+sess.username+'session id: '+sess.sessid)
        }

        else {
            res.send('not logged in')
        }

    })


})

app.get('/register', (req, res) => {
    res.render('register.pug')
    console.log('someone is on register')
})

app.post('/register', (req, res) => {
    db.serialize( () => {
        //structure (uid, username, password, email, fname)
        const stmt = db.prepare('INSERT INTO userTbl(username, password, email, fname) VALUES(?, ?, ?, ?);')
    
        stmt.run(req.body.username, req.body.password, req.body.email, req.body.firstname)

        stmt.finalize()
    })
    db.close()
    console.log(req.body.username)
    console.log(req.body.password)
    console.log(req.body.email)
    console.log(req.body.firstname)
})

app.get('/files/:file(*)', (req, res) => { //                                                file
    const filePath = path.join(__dirname, 'files', req.params.file); //req.params.file where file is the shit
    
    res.download(filePath, (err) => {

        if(!err) {
            return; //works
        }

        
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

    /*
    db.serialize( () => {
        //CREATE TABLE userTbl(uid INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT, fname TEXT);
        var stmt = db.prepare('INSERT INTO userTbl VALUES (?, ?)')
    
        stmt.run(req.body.username, req.body.password)

        stmt.finalize()
      
    })
      
    db.close()
    */
