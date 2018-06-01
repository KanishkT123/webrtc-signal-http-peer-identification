const express = require('express')
const PeerList = require('webrtc-signal-http/lib/peer-list')

class RecognitionPeerList extends PeerList {
    constructor() {
        super()
    }

    //override formatter to only display complementary peer types
    static format() {
        //Use the format method already present in the client
        //Avoids duplicating the same code and maintains parity with PeerList
        allPeers = super.format().split("\n")
        myPeers = ""

        //Servers have only clients displayed
        if (this.name.toLowerCase().includes("server")) {
            for (peer in allPeers) {
                if (peer.toLowerCase().includes("client")) {
                    myPeers += peer + "\n"
                }
            }
        //Clients have only servers displayed
        } else if (this.name.toLowerCase().includes("client")){
            for (peer in allPeers) {
                if (peer.toLowerCase().includes("server")) {
                    myPeers += peer + "\n"
                }
            }
        //If there is no identification, display both
        } else {
            myPeers = allPeers.join("\n")
        }

        return myPeers

    }

    format() {
        return RecognitionPeerList.format.apply(this, arguments)
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
        opts.peerList.format = RecognitionPeerList.format.bind(opts.peerList)
        recognitionPeerList = opts.peerList
    } else {
        recognitionPeerList = new RecognitionPeerList()
    }

    // store the peer list on the router
    router.peerList = recognitionPeerList
}