const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

//endpoint
const user = require('./routes/user');
app.use("/user", user)

const tipe_kamar = require('./routes/tipe_kamar');
app.use("/tipe_kamar", tipe_kamar)

const kamar = require('./routes/kamar');
app.use("/kamar", kamar)

const pemesanan = require('./routes/pemesanan');
app.use("/pemesanan", pemesanan)

app.use(express.static(__dirname))
app.listen(2005, () => {
    console.log("server run on port 2005")
})