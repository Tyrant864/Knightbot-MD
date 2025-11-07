/**
 * Knight Bot - A WhatsApp Bot
 * Copyright (c) 2024 Professor
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * 
 * Credits:
 * - Baileys Library by @adiwajshing
 * - Pair Code implementation inspired by TechGod143 & DGXEON
 */

require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const pino = require("pino")
const readline = require("readline")
const { rmSync } = require('fs')
const store = require('./lib/lightweight_store')
const settings = require('./settings')

// Initialize store
store.readFromFile()
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000)

// Memory optimization
setInterval(() => { if(global.gc) global.gc() }, 60_000)
setInterval(() => { if(process.memoryUsage().rss/1024/1024 > 400) process.exit(1) }, 30_000)

let phoneNumber = "911234567890"
let owner = JSON.parse(fs.readFileSync('./data/owner.json'))
global.botname = "KNIGHT BOT"
global.themeemoji = "•"

const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")
const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => rl ? new Promise(r => rl.question(text, r)) : Promise.resolve(settings.ownerNumber || phoneNumber)

async function startXeonBotInc() {
    let { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache()

    const XeonBotInc = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid)
            let msg = await store.loadMessage(jid, key.id)
            return msg?.message || ""
        },
        msgRetryCounterCache
    })

    store.bind(XeonBotInc.ev)

    XeonBotInc.ev.on('messages.upsert', async chatUpdate => {
        try { await handleMessages(XeonBotInc, chatUpdate, true) } catch {}
    })

    XeonBotInc.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode
            if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                try { rmSync('./session', { recursive: true, force: true }) } catch {}
                startXeonBotInc()
            } else startXeonBotInc()
        }
    })

    XeonBotInc.ev.on('creds.update', saveCreds)
    return XeonBotInc
}

// Start bot
startXeonBotInc().catch(err => console.error(err))

// ==========================
// Tiny web server for Replit + UptimeRobot
// ==========================
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('🤖 Knight Bot is running!'));
app.listen(PORT, () => console.log(`✅ Web server running on port ${PORT}`));
