module.exports = (function () {

return {
    "startLndMobile":"c3RhcnRlZA==",
    "unlockWallet":"",
    "getInfoNotSynced":{"identity_pubkey":"020cd037f0054f92d6a986229c932b4022d6cf3ab6f299c9ac1f34f7063cd5e80e","num_active_channels":0,"alias":"020cd037f0054f92d6a9","testnet":true,"synced_to_chain":false,"block_height":1163213,"uris":[]},
    "getInfo":{"identity_pubkey":"020cd037f0054f92d6a986229c932b4022d6cf3ab6f299c9ac1f34f7063cd5e80e","num_active_channels":0,"alias":"020cd037f0054f92d6a9","testnet":true,"synced_to_chain":true,"block_height":1563213,"uris":[]},
    "listChannels": [{"active":true,"remote_pubkey":"030d00c842f9500b32197f9915202eedec90fa9ca86315eaa9ec54c96f09b7e1cb","channel_point":"f6beee56cc7f4509d26c04ab4a5817790422da778dcc37c81ac02069a69d9c11:0","chan_id":1718773069214122000,"capacity":109409,"local_balance":100359,"remote_balance":0}],
    "pendingChannels":{"total_limbo_balance":0,"pending_open_channels":[{"channel":{"remote_node_pub":"027455aef8453d92f4706b560b61527cc217ddf14da41770e8ed6607190a1851b8","channel_point":"6f2a9da422f552b2b375ef877f5b766b67512823a24e7487a157c6138edcc575:1","capacity":5470453,"local_balance":5461403,"remote_balance":0},"confirmation_height":0,"commit_fee":9050,"commit_weight":600,"fee_per_kw":12500}],"pending_closing_channels":[],"pending_force_closing_channels":[],"waiting_close_channels":[]},
    "getChannelBalance":{"balance":100359,"pending_open_balance":5461403},
    "getNodeInfo":{},
    "addInvoice":{},
    "subscribeInvoices":{},
    "subscribeTransactions":{},
    "closeChannel":{},
    "openChannel":{},
    "sendCoins":{},
    "connectPeer":{},
    "sendPayment":{},
    "decodePayReq":{},
    "newAddress":{},
    "listInvoices":[{"creation_date":1562647218,"memo":"","amt_paid":0,"value":1,"payment_request":"lnbc10n1pwjgx4jpp5u4p37yjwn5xjr7gdjfzntqwldgef5zlge79l3wqkwdhcjn3u32ysdqqcqzpgxqzjcyrzhj45xxjqasgar7d3u0ata6cdr0xsheky8wfayjxw5fsgfmwy9lp4mu98vepu0yt4rxgm5evhs0pftdyshy5qnsjnjax5eu8qcl0cpjfu469","settled":false,"state":"OPEN","r_hash":"e5431f124e9d0d21f90d92453581df6a329a0be8cf8bf8b816736f894e3c8a89"},{"creation_date":1562647226,"memo":"sdsdassd","amt_paid":0,"value":100,"payment_request":"lnbc1u1pwjgx46pp5jee3wqqjxdphhlca474csurdypsc23n99hhjhqvlks5lkqwmj5zsdqdwdj8xerpwdekgcqzpgxqzjc0xsus7mxvk0x9pzynyg7egncyyxy7trw7n27wt8dyj3h3lvc2qlkx8rykd5eht5rz48lf7wl33fpumz33zldmxrlcn6trcw3m6mrxespft3wqt","settled":false,"state":"OPEN","r_hash":"967317001233437bff1dafab88706d20618546652def2b819fb429fb01db9505"}],
    "getTransactions":{},
    "listPayments":{},
    "getWalletBalance":{},
    "exportAllChannelBackup":{},
    "connect":{},
    "generateSeed":{"cipherSeedMnemonic":["absent","north","swamp","eight","wait","rib","viable","wonder","explain","doll","aunt","wool","initial","sunset","modify","chair","bright","into","exercise","shy","twelve","dial","robust","parent"]},
    "createWallet":{},
    "signMessage":{},
    "verifyMessage":{},
    "downloadUTXOSet1":JSON.stringify({"type":"download","progress":0.1,"complete":false}),
    "downloadUTXOSet2":JSON.stringify({"type":"download","progress":0.43,"complete":false}),
    "downloadUTXOSet3":JSON.stringify({"type":"download","progress":1,"complete":true}),
    "downloadUTXOSet4":JSON.stringify({"type":"download","progress":1,"complete":true,"checksum":"d3432rdwdew342323e"}),
    "unZipUTXOSet1":JSON.stringify({"type":"download","progress":0.2,"complete":false}),
    "unZipUTXOSet2":JSON.stringify({"type":"download","progress":0.77,"complete":false}),
    "unZipUTXOSet3":JSON.stringify({"type":"download","progress":1,"complete":true})
    
}

}());