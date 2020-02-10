const express = require("express");
const app = express();
const config = require("./config");

app.set("port", config.PORT);
app.listen(app.get("port"));

app.get(`${config.URL_BASE}/:name`, (req, res) => {
    const name = req.params.name;
    res.sendFile(`${__dirname}/audios/${name}`);
});