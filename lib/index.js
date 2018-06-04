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
        let myPeers = ""
        let currentPeer = this._peers[peerId]
        let currentName = currentPeer._name.toLowerCase()

        allPeers = allPeers.split('\n')

        //Servers have only clients displayed
        if (currentName.includes("server")) {
            for (let peer of allPeers) {
                if (peer.toLowerCase().includes("client")) {
                    myPeers += peer + "\n"
                }
            }
        //Clients have only servers displayed
        } else if (currentName.includes("client")) {
            for (let peer of allPeers) {
                if (peer.toLowerCase().includes("server")) {
                    myPeers += peer + "\n"
                }
            }
        
        //If there is no identification, display both
        } else {
            myPeers = allPeers.join("\n")
        }

        if (myPeers == "") {
            myPeers = currentPeer._name + "\n"
        }

        return myPeers

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