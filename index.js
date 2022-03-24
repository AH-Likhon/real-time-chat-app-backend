const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const app = express();
const dotenv = require('dotenv');
// const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
dotenv.config();
const { MongoClient } = require('mongodb');
const { authMiddleware } = require('./middleware/authMiddleware');
const PORT = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q3g5t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

async function run() {
    try {
        await client.connect();
        const database = client.db('Messenger');
        const users = database.collection('users');
        const userLogin = database.collection('user-login');
        const sendMessage = database.collection('send-message');


        // get a user
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await users.findOne(query);
            res.json(user)
        })

        // insert user
        app.post('/users', async (req, res) => {

            const {
                userName,
                email,
                password,
                confirmPassword,
                image
            } = req.body;

            console.log(req.body)

            let error = "";

            if (!userName || !email || !password || !confirmPassword || !image) {
                error = "Fill up the input fields!";
                // res.json({ error })
            }
            if (!userName && email && password && confirmPassword && image) {
                // error.push('please provide your user name');
                error = 'please provide your user name';
            }
            if (userName && !email && password && confirmPassword && image) {
                error = 'please provide your email';
            }
            if (email && !validator.isEmail(email)) {
                error = 'please provide your valid email';
                // res.json({ error })
            }
            if (userName && email && !password && confirmPassword && image) {
                error = 'please provide your password';
                // res.json({ error })
            }
            if (userName && email && password && !confirmPassword && image) {
                error = 'please provide user confirm password';
                // res.json({ error })
            }
            if (password && confirmPassword && password !== confirmPassword) {
                error = 'your password and confirm password not same';
                // res.json({ error })
            }
            if (password && password.length < 6) {
                error = 'please provide password must be 6 charecter';
                // res.json({ error })
            }
            if (userName && email && password && confirmPassword && !image) {
                error = 'please provide your image';
                // res.json({ error })
            }

            if (error) {
                res.json({ error });
            } else {

                try {
                    const checkUser = await users.findOne({ email: email });
                    // console.log(checkUser);

                    if (checkUser) {
                        error = "Your email is already registered";
                        res.json({ error });
                    } else {
                        const user = await users.insertOne({
                            userName,
                            email,
                            password: await bcrypt.hash(password, 10),
                            image,
                            expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000),
                            registerTime: new Date()
                        });



                        const token = jwt.sign({
                            userName,
                            email,
                            password: await bcrypt.hash(password, 10),
                            image,
                            expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000),
                            registerTime: new Date()
                        }, process.env.SECRET, {
                            expiresIn: process.env.TOKEN_EXP
                        });
                        console.log(token);

                        // const result = user;
                        console.log(user);

                        const options = {
                            expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000)
                        }

                        res.status(201).cookie('authToken', token, options).json({
                            successMessage: 'Successfully Registered',
                            token
                        });

                        // res.json(token);
                    }
                    console.log(error);

                } catch (error) {
                    error = "Internal server error";
                    res.json({ error });
                }

            }
        });


        // login post user
        app.post('/user-login', async (req, res) => {
            // console.log(req.body);
            const { email, password } = req.body;

            // const checkUser = await userLogin.findOne({ email: email });

            let error = "";

            if (!email || !password) {
                error = "Fill up the input fields!";
                // res.json({ error })
            }
            if (!email && password) {
                error = "Please, provide your email!";
            }
            if (email && !password) {
                error = "Please, provide your password";
            }
            if (email && !validator.isEmail(email)) {
                error = "Please, provide your valid email";
            }

            if (error) {
                res.json({ error });
            } else {

                try {
                    const checkUser = await users.findOne({ email: email });

                    if (checkUser) {
                        const matchPassword = await bcrypt.compare(password, checkUser.password);

                        if (matchPassword) {

                            const token = jwt.sign({
                                id: checkUser._id,
                                email: checkUser.email,
                                userName: checkUser.userName,
                                image: checkUser.image,
                                registerTime: checkUser.registerTime
                            }, process.env.SECRET, {
                                expiresIn: process.env.TOKEN_EXP
                            });

                            const result = await userLogin.insertOne(checkUser);
                            console.log(result);

                            const options = {
                                expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000)
                            }

                            res.cookie('authToken', token, options).json({
                                successMessage: 'Successfully login',
                                token
                            });
                        } else {
                            error = "Your password didn't match";
                            res.json({ error });
                        }
                    } else {
                        error = "Your email didn't find";
                        res.json({ error });
                    }
                } catch (error) {
                    error = "Internal Server Error";
                    res.json({ error });
                }
            }
        })



        // const verifyLoginUser = async (req, res, next) => {
        //     // const { authToken } = req.cookies;
        //     console.log(authToken);
        //     // if(authToken){

        //     //     const deCodeToken = await jwt.verify(authToken,process.env.SECRET);
        //     //     req.myId =deCodeToken.id; 
        //     //     next();
        //     // }else{
        //     //     res.status(400).json({error:{errorMessage:['please login']}});
        //     // }
        // }

        // get friends
        app.get('/get-friends', async (req, res) => {
            try {
                const getFriends = await users.find({}).toArray();
                res.json({
                    success: true,
                    friends: getFriends
                })
            } catch (error) {
                res.json({ errorMessage: 'Internal Server Error' });
            }
        })


        // get all send message
        app.get('/get-message', async (req, res) => {
            try {
                const getAllMessage = await sendMessage.find({}).toArray();
                console.log(getAllMessage);
                res.json({
                    success: true,
                    getAllMessage
                })
            } catch (error) {
                res.json({ errorMessage: 'Internal Server Error' });
            }
        })


        // insert message
        app.post('/send-message', async (req, res) => {
            const { senderId, senderName, receiverId, message } = req.body;

            try {
                const insertMessage = await sendMessage.insertOne({
                    senderId,
                    senderName,
                    receiverId,
                    message: {
                        text: message,
                        image: ''
                    }
                })
                res.json({
                    success: true,
                    message: {
                        senderId,
                        senderName,
                        receiverId,
                        message: {
                            text: message,
                            image: ''
                        }
                    }
                })
            } catch (error) {
                res.json({ errorMessage: 'Internal Server Error' });
            }
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('ok');
})


app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})