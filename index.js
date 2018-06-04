#!/usr/bin/env node
const express = require('express')
const signalRouterCreator = require('webrtc-signal-http')
const recognitionRouterCreator = require('./lib')

const app = express()
const recognitionRouter = recognitionRouterCreator()

const signalRouter = signalRouterCreator({
    peerList: recognitionRouter.peerList,
    enableLogging: process.env.WEBRTC_SIGNAL_LOGGING || true,
    enableCors: true
})

app.use(signalRouter, recognitionRouter).listen(process.env.PORT || 3000)