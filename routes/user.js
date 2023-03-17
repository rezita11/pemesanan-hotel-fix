const express = require('express');
const bodyParser = require('body-parser');

//import md5
const md5 = require('md5');

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

//untuk menyimpan file foto
const multer = require('multer');
const path = require('path');
const fs = require('fs'); //untuk membaca file system

//import model
const models = require('../models/index');
const user = models.user;

// //import auth
const auth = require('../auth');
const jwt = require('jsonwebtoken');
const SECRET_KEY = "secretkey";
// app.use(auth)

//config storage image
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        //cb = call back 
        cb(null, "./image/foto_user")
    },
    filename: (req,file,cb) => {
        cb(null, "user-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({storage: storage})

//END POINT

//post
app.post("/", auth, upload.single("foto"), (req,res) => {
    if (!req.file) {
        res.json({
            message: "No uploaded file"
        })
    } else {
        let data = {
            nama_user: req.body.nama_user,
            foto: req.file.filename,
            email: req.body.email,
            password: md5(req.body.password),
            role: req.body.role,
        }
        user.create(data)
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

//get user
app.get("/",  (req,res) => {
    user.findAll()
        .then(user => {
            res.json({
                count: user.length,
                user:user
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })

})

//get user by id
//endpoint untuk menampilkan data user berdasarkan id
//GET USER BY ID, METHOD:GET FUCNTION: FINDONE
app.get("/:id_user", auth, (req, res) =>{
    user.findOne({ where: {id_user: req.params.id_user}})
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

//put user
//endpoint untuk mengubah data user berdasarkan id
app.put("/:id", auth, upload.single("foto"), (req, res) =>{
    let param = { id_user: req.params.id}
    let data = {
        nama_user: req.body.nama_user,
        email: req.body.email,
        password: md5(req.body.password),
        role: req.body.role,
    }
    if (req.file) {
        // get data by id
        const row = user.findOne({where: param})
        .then(result => {
            let oldFileName = result.foto
           
            // delete old file
            let dir = path.join(__dirname,"../image/foto_user",oldFileName)
            fs.unlink(dir, err => console.log(err))
        })
        .catch(error => {
            console.log(error.message);
        })

        // set new filename
        data.foto = req.file.filename
    }
    if(req.body.password){
        data.password = md5(req.body.password)
    }

    user.update(data, {where: param})
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
app.delete("/:id", auth, async (req, res) =>{
    try {
        let param = { id_user: req.params.id}
        let result = await user.findOne({where: param})
        let oldFileName = result.foto
           
        // delete old file
        let dir = path.join(__dirname,"../image/foto_user",oldFileName)
        fs.unlink(dir, err => console.log(err))
 
        // delete data
        user.destroy({where: param})
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

//login admin
app.post('/admin', async (req, res) => {
    let params = {
        email: req.body.email,
        password: md5(req.body.password),
        role: 'admin'
    }

    await user.findOne({ where: params })
        .then(result => {
            if (result) {
                let payload = JSON.stringify(result);
                let token = jwt.sign(payload, SECRET_KEY);
                res.json({ success: 1, message: "Login success, welcome back!", token: token })
            } else {
                res.json({ success: 0, message: "Invalid email or password!" })
            }
        })
        .catch(error => res.json({ message: error.message }))
});

//login resepsionis
app.post('/resepsionis', async (req, res) => {
    let params = {
        email: req.body.email,
        password: md5(req.body.password),
        role: 'resepsionis'
    }

    await user.findOne({ where: params })
        .then(result => {
            if (result) {
                let payload = JSON.stringify(result);
                let token = jwt.sign(payload, SECRET_KEY);
                res.json({ success: 1, message: "Login success, welcome back!", token: token })
            } else {
                res.json({ success: 0, message: "Invalid email or password!" })
            }
        })
        .catch(error => res.json({ message: error.message }))
});

module.exports = app;