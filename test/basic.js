const assert = require('assert')
const express = require('express')
const request = require('supertest')
const PeerList = require('webrtc-signal-http/lib/peer-list')
const recognitionRouter = require('../lib')

const appCreator = (peerList) => {
    const router = recognitionRouter({
        peerList: peerList
    })
    const app = express()

    app.use(router)

    // for testing, we also further expose peerList
    app.peerList = router.peerList

    return app
}

describe('webrtc-signal-http-capacity', () => {
    describe('http', () => {
        it('should inherit properly', () => {
            const bpl = new PeerList()
            const app = appCreator(bpl)

            const peerId = app.peerList.addPeer('testPeer', {})

            assert.equal(bpl.getPeerIds().length, 1)

            // both dataFor methods should yield the same result
            assert.equal(app.peerList.dataFor(peerId), bpl.dataFor(peerId))
        })

        it('should only show clients for servers', () => {
            const app = appCreator()

            const clientId1 = app.peerList.addPeer('client1', {})
            const clientId2 = app.peerList.addPeer('client2', {})
            const clientId3 = app.peerList.addPeer('client3', {})
            const serverId1 = app.peerList.addPeer('server1', {})
            const serverId2 = app.peerList.addPeer('server2', {})
            const serverId3 = app.peerList.addPeer('server3', {})

            //Make sure only 3 peers (and the empty string) are returned
            //This is true for each client
            assert.equal(app.peerList.dataFor(clientId1).split("\n").length, 4)
            assert.equal(app.peerList.dataFor(clientId2).split("\n").length, 4)
            assert.equal(app.peerList.dataFor(clientId3).split("\n").length, 4)

            //Make sure these are the same lists being returned 
            assert.equal(app.peerList.dataFor(clientId1), app.peerList.dataFor(clientId2))
            assert.equal(app.peerList.dataFor(clientId1), app.peerList.dataFor(clientId3))
            
            //Make sure there are no clients in the returned peer list
            assert(!app.peerList.dataFor(clientId1).includes("client"))
        })

        it('should only show servers for clients', () => {
            const app = appCreator()

            const clientId1 = app.peerList.addPeer('client1', {})
            const clientId2 = app.peerList.addPeer('client2', {})
            const clientId3 = app.peerList.addPeer('client3', {})
            const serverId1 = app.peerList.addPeer('server1', {})
            const serverId2 = app.peerList.addPeer('server2', {})
            const serverId3 = app.peerList.addPeer('server3', {})

            //Make sure only 3 peers (and the empty string) are returned
            //This is true for each client
            assert.equal(app.peerList.dataFor(serverId1).split("\n").length, 4)
            assert.equal(app.peerList.dataFor(serverId2).split("\n").length, 4)
            assert.equal(app.peerList.dataFor(serverId3).split("\n").length, 4)

            //Make sure these are the same lists being returned 
            assert.equal(app.peerList.dataFor(serverId1), app.peerList.dataFor(serverId2))
            assert.equal(app.peerList.dataFor(serverId1), app.peerList.dataFor(serverId3))

            //Make sure there are no clients in the returned peer list
            assert(!app.peerList.dataFor(serverId1).includes("server"))
        })

        it('should show all peers for unidentified peers', () => {
            const app = appCreator()

            const clientId1 = app.peerList.addPeer('client1', {})
            const clientId2 = app.peerList.addPeer('client2', {})
            const clientId3 = app.peerList.addPeer('client3', {})
            const serverId1 = app.peerList.addPeer('server1', {})
            const serverId2 = app.peerList.addPeer('server2', {})
            const serverId3 = app.peerList.addPeer('server3', {})
            const unknownId1 = app.peerList.addPeer('unknown1', {})


            //Make sure all 7 peers (and the empty string) are returned
            assert.equal(app.peerList.dataFor(unknownId1).split("\n").length, 8)

            //Make sure there are servers in the returned list
            assert(app.peerList.dataFor(unknownId1).includes("server"))

            //Make sure there are clients in the returned list
            assert(app.peerList.dataFor(unknownId1).includes("client"))

        })


    })
})
