/** memanggi library express */
const express = require('express');

// membuat objek express nya
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//import model
const models = require('../models/index');
const tipe_kamar = require('../models/index').tipe_kamar;
const pemesanan = require('../models/index').pemesanan;
const detail_pemesanan = require('../models/index').detail_pemesanan;
const auth = require('../auth');

//endpoint

//post
app.post("/", (req, res) => {
    {
        let data = {
            nomor_pemesanan: req.body.nomor_pemesanan,
            nama_pemesan: req.body.nama_pemesan,
            email_pemesan: req.body.email_pemesan,
            tgl_pemesanan: req.body.tgl_pemesanan,
            tgl_check_in: req.body.tgl_check_in,
            tgl_check_out: req.body.tgl_check_out,
            nama_tamu: req.body.nama_tamu,
            jumlah_kamar: req.body.jumlah_kamar,
            id_tipe_kamar: req.body.id_tipe_kamar,
            status_pemesanan: req.body.status_pemesanan,
            id_user: req.body.id_user,
        }
        pemesanan.create(data)
            .then(async result => {
                //isi ke detail pemesanan
                
                let tgl_check_in = new Date(req.body.tgl_check_in)
                let tgl_check_out = new Date(req.body.tgl_check_out)
                let jumlah_hari = (tgl_check_out.getTime() - tgl_check_in.getTime())/ (1000 * 3600 * 24)
                console.log(jumlah_hari);

                // mendapatkan id pemesanan dari data pemesanan yang baru di insert
                let id_pemesanan = result.id_pemesanan

                //mendapatkan data kamar yang dipilih
                let rooms = req.body.rooms
                let detail = []
                // mendefinisikan harga sesuai tipe kamar
                let id_tipe_kamar = req.body.id_tipe_kamar
                let harga = await tipe_kamar.findOne({
                    where: {id_tipe_kamar: id_tipe_kamar}
                })

                //looping sebanyak kamar
                for (let i = 0; i < rooms.length; i++) {
                    let tgl_akses = tgl_check_in
                    
                    
                    for (let j = 0; j < jumlah_hari; j++) {
                    
                        detail.push({
                            id_pemesanan: id_pemesanan,
                            id_kamar: rooms[i],
                            tgl_akses: tgl_akses,
                            harga: harga.harga

                        })
                        tgl_akses = new Date(tgl_akses.getTime() + 86400000)

                        // tgl_akses.setDate(tgl_akses.getDate() + 1)
                        
                        
                    }
                }

                // memasukkan data ke tabel detail
                console.log(detail);
                await detail_pemesanan.bulkCreate(detail)

                res.json({
                    message: "data has been inserted",
                    detail: detail
                })

            })
            .catch(error => {
                res.json({
                    message: error.massage
                })
            })
    }
})

//get pemesanan
app.get("/", (req, res) =>{
    pemesanan.findAll({
        attributes: {
            exclude: ['userIdUser']
        }
    })
        .then(result =>{
            res.json({
                pemesanan: result
            })
        })
        .catch(error =>{
            res.json({
                message: error.message
            })
        })
})

//get by id
app.get("/:id", async (req, res) =>{
    let param = {id_pemesanan: req.params.id}
    pemesanan.findOne({
        where: param,
        attributes: {
            exclude: ['userIdUser']
        }
    })
        .then(result =>{
            res.json({
                data: result
            })
        })
        .catch(error =>{
            res.json({
                message: error.message
            })
        })
})


//delete pemesanan
// endpoint untuk menghapus data user berdasarkan id
app.delete("/:id", auth, async (req, res) => {
    let param = {
        id_pemesanan: req.params.id
    }
    await detail_pemesanan.destroy({ where: param })

    pemesanan.destroy({ where: param })
        .then(result => {
            res.json({ message: "Data has been deleted" })
        })
        .catch(error => {
            res.json({ message: error.message })
        })
})

//update
//update data
app.put('/:id', auth, async (req, res) => {
    let params = { id_pemesanan: req.params.id };

    let data = {
        status_pemesanan: req.body.status_pemesanan,
        id_user: req.body.id_user,
    };

    await pemesanan.update(data, { where: params })
        .then(result => res.json({ success: 1, message: 'Data has been updated!' }))
        .catch(err => res.json({ message: err.message }))
});
module.exports = app;