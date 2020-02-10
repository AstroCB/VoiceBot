# VoiceBot
VoiceBot is a bot for automatically downloading audio clips sent through Facebook Messenger and then hosting them on an external server.

After the bot downloads a clip, it will send a link to a page where the file can be played and downloaded.

## Usage
Clone this repo and create a `config.js` file at the root with the following exports:

```js
exports.THREAD_ID = /* ID of thread where bot will run */;
exports.PORT = /* port for web server to run on */;
exports.SERVER_URL = /* publicly-accessible URL of the server */;
exports.URL_BASE = /* URLs will be in the form https://SERVER_URL:PORT/URL_BASE/...*/;
```

Then run `npm install` and `npm start`, which will spin up a [`pm2`](https://pm2.keymetrics.io) daemon to keep the bot running.