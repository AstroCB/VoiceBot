const botcore = require("messenger-botcore");
const request = require("request");
const fs = require("fs");
const config = require("./config");
const server = require("./server");

let gapi;

// Bot stuff
botcore.login.login({
    MEMCACHIER_USERNAME: process.env.MEMCACHIER_USERNAME,
    MEMCACHIER_PASSWORD: process.env.MEMCACHIER_PASSWORD,
    MEMCACHIER_SERVERS: process.env.MEMCACHIER_SERVERS
}, (err, api) => {
    if (!err) {
        gapi = api;
        api.setOptions({ listenEvents: true });
        api.listenMqtt(listener);
    } else {
        console.log(err);
    }
});

function listener(err, msg) {
    if (!err && msg.threadID && msg.threadID == config.THREAD_ID
        && msg.attachments && msg.attachments) {
        const audios = msg.attachments.filter(m => m.type == "audio");

        audios.forEach(audio => {
            downloadFile(audio.url, audio.filename);
        });
    }
}

function downloadFile(url, filename) {
    const fullpath = `${__dirname}/audios/${filename}`;

    request(url).pipe(fs.createWriteStream(fullpath)).on('close', (err, data) => {
        console.log(`Downloaded ${filename}.`);

        gapi.sendMessage({
            url: `http://${config.SERVER_URL}:${config.PORT}${config.URL_BASE}/${filename}`
        }, config.THREAD_ID);
    });
}