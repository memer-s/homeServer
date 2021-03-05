const express = require('express');
const path = require('path');
const pug = require('pug');
const session = require('express-session');
const fileUpload = require('express-fileupload');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('dwndb.db');

const port = 5000

const app = express()

const pics = 2;

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
app.use(fileUpload())

app.get('/', (req, res) => {
    console.log('someone is on index')

    try {
        if(sess.uid != null) {
            console.log('logged in and id is '+sess.uid+' and username is '+sess.username+' session id: '+sess.sessid)
        }
        res.render('index.pug', {username: sess.username,})
    }
    catch {
        console.log('no session found')
        res.render('index.pug')
    }

});

//------------------------------------------------------------
// todo:
// session working for everyone...
//------------------------------------------------------------

app.get('/downloads', (req, res) => {
    
    db.all('SELECT * FROM downloadTbl;', [], (err, rows ) => {
        if(err) {
            throw err
        }

        if(rows != null) {
            const rowcount = rows.length;

            res.render('downloads.pug', {
                rows,
                rowcount,
                pics, 
                preview:'Shaggy_zoinks_face.jpg',
            })
            console.log(rows);
        }
    })
    db.close()

    console.log('someone is on downloads')
});

app.get('/login', (req, res) => {
    res.render('login.pug')
    try {
        console.log(sess.username+' is on login')
    }
    catch {
        console.log('someone is on login')
    }
})

app.post('/login', (req, res) => {

    
    //const stmt = db.prepare('SELECT * FROM userTbl WHERE username = ? AND password = ?');

    db.get('SELECT * FROM userTbl WHERE username = ? AND password = ?;', [req.body.username, req.body.password], (err, row) => {
        if(err) {
            throw err
        }

        if(row != null) {
            res.send('index.pug')
            //console.log(row.uid);
            sess = req.session;
            sess.sessid = req.sessionID;
            sess.uid = row.uid;
            sess.username = row.username;
            console.log('logged in and id is '+sess.uid+' and username is '+sess.username+' session id: '+sess.sessid);
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

app.get('/upload', (req, res) => {
    res.render('upload.pug')
    console.log('someone is on register')
})

app.post('/upload', (req, res) => {
    
    let preview;
    let file;
    let previewPath;
    let filePath;

    
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    

    preview = req.files.preview;
    previewPath = __dirname + '/public/images/' + preview.name;
  
    // Use the mv() method to place the file somewhere on your server
    preview.mv(previewPath, function(err) {
        if (err)
            console.log(err)
    
        console.log('file 1 uploaded')
    });

    file = req.files.preview;
    filePath = __dirname + '/files/' + file.name;
  
    // Use the mv() method to place the file somewhere on your server
    file.mv(filePath, function(err) {
        if (err)
            console.log(err)
    
        console.log('file 1 uploaded')
    });

    db.serialize( () => {
        //structure downloadTbl(pid, title, text, date, preview, file)
        const stmt = db.prepare('INSERT INTO downloadTbl(title, text, date, preview, file) VALUES(?, ?, ?, ?, ?);')
    
        stmt.run(req.body.title, req.body.text, req.body.date, preview.name, file.name)

        stmt.finalize()
    })
    console.log(req.body.title)
    console.log(req.body.text)
    console.log(req.body.date)
    res.redirect('/downloads')
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
