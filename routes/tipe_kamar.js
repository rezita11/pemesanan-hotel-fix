const express = require('express');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//untuk menyimpan file foto
const multer = require('multer');
const path = require('path');
const fs = require('fs'); //untuk membaca file system

//import model
const models = require('../models/index');
const tipe_kamar = require('../models/index').tipe_kamar;


//import auth
const auth = require('../auth');
app.use(auth)

//import hak akses
const akses = require('../hakAkses')

//config storage image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //cb = call back 
        cb(null, "./image/foto_tipe_kamar")
    },
    filename: (req, file, cb) => {
        cb(null, "tipe_kamar-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({ storage: storage })

//END POINT

//post
app.post("/", auth, upload.single("foto"), async (req, res) => {
    let granted = await akses.admin(req);
    if (!granted.status) {
        return res.status(403).json(granted.message);
    }
    await tipe
    if (!req.file) {
        res.json({
            message: "No uploaded file"
        })
    } else {
        let data = {
            nama_tipe_kamar: req.body.nama_tipe_kamar,
            harga: req.body.harga,
            deskripsi: req.body.deskripsi,
            foto: req.file.filename,
        }
        tipe_kamar.create(data)
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

//get tipe kamar
app.get("/", (req, res) => {
    tipe_kamar.findAll()
        .then(tipe_kamar => {
            res.json({
                count: tipe_kamar.length,
                tipe_kamar: tipe_kamar
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })

})

//get tipe kamar by id
//endpoint untuk menampilkan data tipe kamar berdasarkan id
//GET tipe kamar BY ID, METHOD:GET FUCNTION: FINDONE
app.get("/:id_tipe_kamar", (req, res) => {
    tipe_kamar.findOne({ where: { id_tipe_kamar: req.params.id_tipe_kamar } })
        .then(result => {
            res.json({
                tipe_kamar: result
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

//put tipe kamar
//endpoint untuk mengubah data tipe kamar berdasarkan id
app.put("/:id", auth, upload.single("foto"), async (req, res) => {
    let granted = await akses.admin(req);
    if (!granted.status) {
        return res.status(403).json(granted.message);
    }
    
    let param = { id_tipe_kamar: req.params.id }
    let data = {
        nama_tipe_kamar: req.body.nama_tipe_kamar,
        harga: req.body.harga,
        deskripsi: req.body.deskripsi,
        foto: req.file.foto,
    }
    if (req.file) {
        // get data by id
        const row = tipe_kamar.findOne({ where: param })
            .then(result => {
                let oldFileName = result.foto

                // delete old file
                let dir = path.join(__dirname, "../image/foto_tipe_kamar", oldFileName)
                fs.unlink(dir, err => console.log(err))
            })
            .catch(error => {
                console.log(error.message);
            })

        // set new filename
        data.foto = req.file.filename
    }

    tipe_kamar.update(data, { where: param })
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

//delete user
// endpoint untuk menghapus data user berdasarkan id
app.delete("/:id", auth, async (req, res) => {
    let granted = await akses.admin(req);
    if (!granted.status) {
        return res.status(403).json(granted.message);
    }
    await tipe
    try {
        let param = { id_tipe_kamar: req.params.id }
        let result = await tipe_kamar.findOne({ where: param })
        let oldFileName = result.foto

        // delete old file
        let dir = path.join(__dirname, "../image/foto_tipe_kamar", oldFileName)
        fs.unlink(dir, err => console.log(err))

        // delete data
        tipe_kamar.destroy({ where: param })
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

module.exports = app;