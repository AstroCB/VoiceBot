const fs = require("fs");
const express = require("express");
const app = express();
const config = require("./config");

const AUDIO_DIR = "/audios"

app.set("port", config.PORT);
app.set("view engine", "pug");
app.use(`${config.URL_BASE}/static`, express.static("static"));
app.listen(app.get("port"));

// Serve audio files from the folder
app.get(`${AUDIO_DIR}/:author/:clip`, (req, res) => {
    const author = req.params.author;
    const clip = req.params.clip;
    const path = `${__dirname}${AUDIO_DIR}/${author}/${clip}`

    fs.access(path, err => {
        if (err) {
            res.sendStatus(404);
        } else {
            res.sendFile(path);
        }
    });
});

// Render a simple web player to play audio in browser
app.get(`${config.URL_BASE}/:author/:clip`, (req, res) => {
    const author = req.params.author;
    const clip = req.params.clip;
    const path = `${AUDIO_DIR}/${author}/${clip}`;

    fs.access(`${__dirname}${path}`, err => {
        if (err) {
            res.sendStatus(404);
        } else {
            res.render("index", {
                "author": author,
                "path": path,
                "root": config.URL_BASE
            });
        }
    });
});

// Landing page
app.get(`${config.URL_BASE}/`, (_, res) => {
    fs.readdir(`${__dirname}${AUDIO_DIR}`, (err, files) => {
        if (err || files.length === 0) {
            res.sendStatus(500)
        } else {
            res.render("navigator", {
                "items": files.filter(f => f !== '.gitignore'),
                "root": config.URL_BASE
            });
        }
    })
});


// Individual author pages
app.get(`${config.URL_BASE}/:author/`, (req, res) => {
    const author = req.params.author;
    fs.readdir(`${__dirname}${AUDIO_DIR}/${author}`, (err, files) => {
        if (err || files.length === 0) {
            res.sendStatus(404)
        } else {
            res.render("navigator", {
                "items": files,
                "root": config.URL_BASE
            });
        }
    })
});