const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const databaseConnect = require('./database');
const router = require('./routes/auth');

databaseConnect();

// cloud.mongodb.com/v2/61722f39f2d0a97a43daa56d#metrics/replicaSet/6172304a2b4463065be113c3/explorer/Attendance/Record-Time/find

// const { MongoClient } = require('mongodb');
// const cors = require('cors');
// const ObjectId = require('mongodb').ObjectId;
// const { mongoose, model, Schema } = require('mongoose');
// const formidable = require('formidable');
// const validator = require('validator');
// const fs = require('fs');
// const bcrypt = require('bcrypt');

//middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }))

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q3g5t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// URL = mongodb://localhost/messenger
// useCreateIndex: true

// async function run() {
//     try {
//         const registerSchema = new Schema({
//             userName: {
//                 type: String,
//                 required: true
//             },
//             email: {
//                 type: String,
//                 required: true
//             },
//             password: {
//                 type: String,
//                 required: true
//             },
//             image: {
//                 type: String,
//                 required: true
//             },
//         }, { timestamps: true});
        
//         await client.connect();
//         const database = client.db('Messenger');
//         const registeredUser = database.collection('Registered-User');

//         // console.log(registerSchema);

        
//         app.post('/registered-user', async (req, res) => {
//             const job = req.body;
//             // const result = await jobs.insertOne(job);
//             console.log(job);

//             // res.json(result);
//         });



//         // app.post('/registered-user', async (req,res) => {
//         //     // console.log('ok');
//         //     const formData = formidable();
//         //     formData.parse(req, async (err, fields, files) => {
//         //         // console.log(fields);
//         //         // console.log(files.image);

//         //         const { userName, email, password, confirmPassword } = fields;
//         //         const { image } = files;
//         //         // console.log(image.originalFilename);

//         //         const error = [];

//         //         if(!userName){
//         //             error.push('Please, provide your user name');
//         //         }
//         //         if(!email || !validator.isEmail(email)){
//         //             error.push('Please, provide your valid email');
//         //         }
//         //         if(!password){
//         //             error.push('Please, provide your password');
//         //         }
//         //         if(!confirmPassword){
//         //             error.push('Please, fill out confirm password');
//         //         }
//         //         if(password && confirmPassword && password !== confirmPassword){
//         //             error.push("Password didn't match");
//         //         }
//         //         if(password && password.length < 6){
//         //             error.push('Password must be greater than 6 characters');
//         //         }
//         //         if(Object.keys(files).length === 0){
//         //             error.push('Please, provide your image')
//         //         }
//         //         if(error.length > 0){
//         //             res.status(400).json({error: { errorMessage: error}});
//         //         }else{
//         //             const getImageName = image.originalFilename;
//         //             console.log(image.filepath)

//         //             const randomNumber = Math.floor(Math.random() * 99999);
//         //             const newImageName = randomNumber + getImageName;
//         //             files.image.originalFilename = newImageName;

//         //             const newPath = __dirname + `../frontend/public/images/${files.image.originalFilename}`;

//         //             try {
//         //                 const checkUser = await registeredUser.findOne({email: email});

//         //                 if(checkUser){
//         //                     res.status(404).json({error:{errorMessage:['This already existed']}});
//         //                 }else{
//         //                     fs.copyFile(files.image.filepath, newPath, async (error) => {
//         //                         if(!error){
//         //                             const userCreate = await registeredUser.insertOne({
//         //                                 userName,
//         //                                 email,
//         //                                 password: await bcrypt.hash(password,10),
//         //                                 image: files.image.originalFilename
//         //                             });
//         //                             console.log(userCreate);

//         //                             console.log('Registration successfully done');
//         //                         }
//         //                     })
//         //                 }
//         //             } catch (error) {
//         //                 console.log(error);
//         //             }

//         //         }
//         //     })
//         // })
        
//     }
//     finally {
//         // await client.close();
//     }
// }
// run().catch(console.dir);

app.use('/', router)

app.get('/', (req, res) => {
    res.send('Real Time Chat Application Server');
});



app.listen(port, () => {
    console.log('Real Time Chat Application:', port);
});