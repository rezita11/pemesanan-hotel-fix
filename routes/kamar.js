const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//import model
const models = require('../models/index');
// const tipe_kamar = require('../models/tipe_kamar');
const kamar = models.kamar;
const tipe_kamar = models.tipe_kamar;
const detail_pemesanan = models.detail_pemesanan;

const Sequelize = require("sequelize");
const Op = Sequelize.Op

//import auth
const auth = require("../auth")
const akses = require('../hakAkses')
// app.use(auth)

//post kamar
app.post("/",auth , async (req,res) => {

    let granted = await akses.admin(req);
    if (!granted.status) {
        return res.status(403).json(granted.message);
    }

    {
        let data = {
            nomor_kamar: req.body.nomor_kamar,
            id_tipe_kamar: req.body.id_tipe_kamar,
        }
        kamar.create(data)
        .then(result => {
            res.json({
                message: "data has been inserted"
            })
        })
        .catch(error => {
            res.json({
                message: error.massage
            })
        })
    }
})

//get kamar
//endpoint ditulis disini
app.get("/", async (req,res)=> {

    // let granted = await akses.admin(req);
    // if (!granted.status) {
    //     return res.status(403).json(granted.message);
    // }

    kamar.findAll()
    .then(kamar => {    
        res.json({
            count: kamar.length,
            kamar: kamar
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

//get kamar by id
//endpoint untuk menampilkan data kamar berdasarkan id
app.get("/:id_kamar", (req, res) =>{
    kamar.findOne({ where: {id_user: req.params.id_user}})
    .then(result => {
        res.json({
            user: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

//update data
app.put("/:id", auth ,async (req, res) =>{

    let granted = await akses.admin(req);
    if (!granted.status) {
        return res.status(403).json(granted.message);
    }

    let param = { id_kamar: req.params.id}
    let data = {
        nomor_kamar: req.body.nomor_kamar,
        id_tipe_kamar: req.body.id_tipe_kamar,
    }
    kamar.update(data, {where: param})
        .then(result => {
            res.json({
                message: "data has been updated",
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

//delete data
app.delete("/:id", auth ,async (req, res) =>{

    let granted = await akses.admin(req);
    if (!granted.status) {
        return res.status(403).json(granted.message);
    }

    try {
        let param = { id_kamar: req.params.id}
        let result = kamar.findOne({where: param})
        // let oldFileName = result.foto
           
        // // delete old file
        // let dir = path.join(__dirname,"../image/foto_tipe_kamar",oldFileName)
        // fs.unlink(dir, err => console.log(err))
 
        // delete data
        kamar.destroy({where: param})
        .then(result => {
           
            res.json({
                message: "data has been deleted",
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
 
    } catch (error) {
        res.json({
            message: error.message
        })
    }
})

app.post("/find/available", async (req, res) => {
    const tgl_check_in = req.body.tgl_check_in
    const tgl_check_out = req.body.tgl_check_out

    if (tgl_check_in === "" || tgl_check_out === "") {
        return res.status(200).json({
            message: "null",
            code: 200,
            kamar: []
        });
    }

    const roomData = await tipe_kamar.findAll({
        attributes: ["id_tipe_kamar", "nama_tipe_kamar", "harga", "foto", "deskripsi"],
        include: [
            {
                model: kamar,
                as: "kamar"
            }
        ]
    })

    const roomBookedData = await tipe_kamar.findAll({
        attributes: ["id_tipe_kamar", "nama_tipe_kamar", "harga", "foto", "deskripsi"],
        include: [
            {
                model: kamar,
                as: "kamar",
                include: [
                    {
                        model: detail_pemesanan,
                        as: "detail_pemesanan",
                        attributes: ["tgl_akses"],
                        where: {
                            tgl_akses: {
                                [Op.between]: [tgl_check_in, tgl_check_out]
                            }
                        }
                    }
                ]
            }
        ]
    })

    const available = []
    const availableByType = []

    for (let i = 0; i < roomData.length; i++) {
        roomData[i].kamar.forEach((kamar) => {
            let isBooked = false
            roomBookedData.forEach((booked) => {
                booked.kamar.forEach((bookedRoom) => {
                    if (kamar.id_kamar === bookedRoom.id_kamar) {
                        isBooked = true
                    }
                })
            })

            if (!isBooked) {
                available.push(kamar)
            }
        })
    }

    for (let i = 0; i < roomData.length; i++) {
        let tipe_kamar = {}
        tipe_kamar.id_tipe_kamar = roomData[i].id_tipe_kamar
        tipe_kamar.nama_tipe_kamar = roomData[i].nama_tipe_kamar
        tipe_kamar.harga = roomData[i].harga
        tipe_kamar.foto = roomData[i].foto
        tipe_kamar.deskripsi = roomData[i].deskripsi
        tipe_kamar.kamar = []
        available.forEach(( kamar) => {
            if (kamar.id_tipe_kamar === roomData[i].id_tipe_kamar) {
                tipe_kamar.kamar.push(kamar)
            }
        })
        if (tipe_kamar.kamar.length > 0) {
            availableByType.push(tipe_kamar)
        }
    }

    return res.status(200).json({
        message: "Succes to get available room by type room",
        code: 200,
        roomAvailable: available,
        roomAvailableCount: available.length,
        kamar: availableByType,
        typeRoomCount: availableByType.length
    });
});

module.exports = app;   