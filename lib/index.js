const express = require('express')
const PeerList = require('webrtc-signal-http/lib/peer-list')

class RecognitionPeerList extends PeerList {
    constructor() {
        super()
    }

    //override formatter to only display complementary peer types
    static dataFor(peerId) {
        //Use the format method already present in the client
        //Avoids duplicating the same code and maintains parity with PeerList and it's extensions
        let allPeers = this.format()
        let myPeers = ''
        let currentPeer = this._peers[peerId]
        let currentName = currentPeer._name.toLowerCase()

        allPeers = allPeers.split('\n').filter(e => e.length > 0)

        //Servers have only clients displayed
        if (currentName.includes('server')) {
            // if we're using pairing
            if (process.env.WEBRTC_PEERID_PAIRING) {
                myPeers = allPeers.map(p => p.split(','))
                    // parse the peer, making the rest of the code easier
                    .map(p => { return {name: p[0], id: p[1], status: p[2]}})
                    // select just those with valid data
                    .filter(p => p.name && p.id && p.status)
                    // select just those that are clients
                    .filter(p => p.name.toLowerCase().includes('client'))
                    // select just those that either do not have a pairId, or are already assigned to us
                    .filter(p => !this._peers[p.id].pairId || this._peers[p.id].pairId == peerId)
                    // sort such that those with pairIds are first
                    .sort((a,b) => {
                        if (this._peers[a.id].pairId && !this._peers[b.id].pairId) {
                            return -1
                        } else if (!this._peers[a.id].pairId && this._peers[b.id].pairId) {
                            return 1
                        } else {
                            return a.id - b.id
                        }
                    })
                    // take the appropriate number of peers
                    .slice(0, process.env.WEBRTC_PEERID_RESPECT_CAPACITY ? currentPeer.capacity || 1 : 1)
                    // convert back to string, setting underlying pairId on the way
                    .map((p) => {
                        this._peers[p.id].pairId = peerId

                        return `${p.name},${p.id},${p.status}`
                    })
                    // rejoin back, using \n as terminator
                    .join('\n')
            // if we are not using pairing
            } else {
                myPeers = allPeers.filter(p => p.toLowerCase().includes('client')).join('\n')
            }
        //Clients have only servers displayed
        } else if (currentName.includes('client')) {
            myPeers = allPeers.filter(p => p.toLowerCase().includes('server')).join('\n')
        
        //If there is no identification, display both
        } else {
            myPeers = allPeers.join('\n')
        }

        // if there is no data, write your own peer data
        if (myPeers == '') {
            myPeers = `${currentPeer._name},${peerId},${currentPeer.status() ? 1 : 0}`
        }

        // data must always end with a \n
        return `${myPeers}\n`
    }

    dataFor(peerId) {
        return RecognitionPeerList.dataFor.call(this, peerId)
    }
}

module.exports = (opts) => {
    opts = opts || {}

    const router = express.Router()

    // abstracted peer message sender logic
    // this will direct send if possible, otherwise
    // it will buffer into the peerList
    const sendPeerMessage = (srcId, destId, data) => {
        // find the current peer
        const peer = router.peerList.getPeer(destId)

        if (peer.status()) {
            peer.res
                .status(200)
                .set('Pragma', srcId)
                .send(data)
        }
            // otherwise we buffer
        else {
            router.peerList.pushPeerData(srcId, destId, data)
        }
    }

    let recognitionPeerList

    if (opts.peerList) {
        opts.peerList.dataFor = RecognitionPeerList.dataFor.bind(opts.peerList)
        recognitionPeerList = opts.peerList
    } else {
        recognitionPeerList = new RecognitionPeerList()
    }

    // store the peer list on the router
    router.peerList = recognitionPeerList

    return router
}