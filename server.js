const fs = require("fs");
const express = require("express");
const app = express();
const config = require("./config");

app.set("port", config.PORT);
app.set("view engine", "pug");
app.use(`${config.URL_BASE}/static`, express.static("static"));
app.listen(app.get("port"));

// Serve audio files from the folder
app.get(`/audios/:author/:clip`, (req, res) => {
    const author = req.params.author;
    const clip = req.params.clip;
    const path = `${__dirname}/audios/${author}/${clip}`

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
    const path = `/audios/${author}/${clip}`;

    fs.access(`${__dirname}/${path}`, err => {
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