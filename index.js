const botcore = require("messenger-botcore");
const fs = require("fs");
const request = require("request");
const FileType = require("file-type");
const TinyURL = require("tinyurl");
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
    if (!msg) return;

    botcore.banned.isMessage(msg, isBanned => {
        if (!err && msg.threadID && !isBanned
            && config.THREAD_IDS.includes(msg.threadID)
            && msg.attachments && msg.attachments) {
            // Also pull user information for attribution
            const audios = msg.attachments.filter(m => m.type == "audio");

            if (audios.length > 0) {
                api.getUserInfo(msg.senderID, (err, info) => {
                    if (!err) {
                        const userName = info[msg.senderID].firstName;

                        audios.forEach(audio => {
                            downloadFile(userName, msg.threadID, audio.url, audio.filename);
                        });
                    } else {
                        api.sendMessage("Sorry, couldn't retrieve author info for download.", msg.threadID);
                    }
                });
            }
        }
    });
}

function downloadFile(author, threadId, url, filename) {
    const userDir = `${__dirname}/audios/${author}`;

    // Create directory for a user's recordings if it doesn't yet exist
    if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir);
    }

    const fullPath = `${userDir}/${filename}`;
    request(url).pipe(fs.createWriteStream(fullPath)).on('close', async (err, data) => {
        console.log(`Downloaded ${filename}.`);

        // Read file to determine true file type (not extension reported by FB)
        const calcFileType = await FileType.fromFile(fullPath);
        let fixedFileName = filename;
        if (calcFileType && calcFileType.ext) {
            const reportedFileType = filename.match(/^([^.]+)\.(.+)$/);
            const fileStub = (reportedFileType && reportedFileType[2]) ? reportedFileType[1] : filename;

            // If FB isn't giving us an ext, or the ext they're giving us doesn't match the true ext,
            // rename the file with the proper one
            if (!reportedFileType || (reportedFileType[2] && (reportedFileType[2] != calcFileType.ext))) {
                fixedFileName = `${fileStub}.${calcFileType.ext}`;
                fs.renameSync(fullPath, `${userDir}/${fixedFileName}`);
            }
        }

        const url = `http://${config.SERVER_URL}${config.URL_BASE}/${author}/${fixedFileName}`;
        TinyURL.shorten(url, (res, err) => { // Why does the TinyURL API have the params in this order?
            api.sendMessage({
                body: err ? url : res,
                url: url
            }, threadId);
        });
    });
}
