const botcore = require("messenger-botcore");
const request = require("request");
const fs = require("fs");
const FileType = require("file-type");
const config = require("./config");
const server = require("./server");

let api;

botcore.login.login({
    MEMCACHIER_USERNAME: process.env.MEMCACHIER_USERNAME,
    MEMCACHIER_PASSWORD: process.env.MEMCACHIER_PASSWORD,
    MEMCACHIER_SERVERS: process.env.MEMCACHIER_SERVERS
}, (err, apiInstance) => {
    if (!err) {
        api = apiInstance;
        api.setOptions({ listenEvents: true });
        api.listenMqtt(listener);
    } else {
        console.log(err);
    }
});

// Listen for audio messages and download them
function listener(err, msg) {
    if (!err && msg.threadID && msg.threadID == config.THREAD_ID
        && msg.attachments && msg.attachments) {
        // Also pull user information for attribution
        const audios = msg.attachments.filter(m => m.type == "audio");
        console.log(audios);
        if (audios.length > 0) {
            api.getUserInfo(msg.senderID, (err, info) => {
                if (!err) {
                    const userName = info[msg.senderID].firstName;

                    audios.forEach(audio => {
                        downloadFile(userName, audio.url, audio.filename);
                    });
                } else {
                    api.sendMessage("Sorry, couldn't retrieve author info for download.", msg.threadID);
                }
            });
        }
    }
}

function downloadFile(author, url, filename) {
    const userDir = `${__dirname}/audios/${author}`;
    const fullPath = `${userDir}/${filename}`;

    // Create directory for a user's recordings if it doesn't yet exist
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
    }

    request(url).pipe(fs.createWriteStream(fullPath)).on('close', (err, data) => {
        console.log(`Downloaded ${filename}.`);
        
        const url = `http://${config.SERVER_URL}:${config.PORT}${config.URL_BASE}/${author}/${filename}`;
        api.sendMessage({
            body: url,
            url: url
        }, config.THREAD_ID);
    });
}