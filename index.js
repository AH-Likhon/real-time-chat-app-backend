const express = require('express');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
dotenv.config();
const { MongoClient, ObjectId } = require('mongodb');
const PORT = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q3g5t.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(cookieParser());

var http = require('http').Server(app);
var io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


// ----------------------------  socket code start ------------------------------- //

let users = [];

const addUser = (userId, socketId, userInfo) => {
    const checkUser = users.some(user => user.userId === userId);

    if (!checkUser) {
        users.push({
            userId,
            socketId,
            userInfo
        })
    }
}

const removeUser = socketId => {
    users = users.filter(user => user.socketId !== socketId);
}

const findUser = id => {
    const result = users.find(user => user.userId === id);
    return result;
};

const userLogout = userId => {
    users = users.filter(user => user.userId !== userId);
};

io.on('connection', socket => {
    // console.log('Socket is running....');

    socket.on('addUser', (userId, userInfo) => {
        addUser(userId, socket.id, userInfo);
        io.emit('getUser', users);

        const restUsers = users.filter(user => user.userId !== userId);
        const newRes = 'add_new_user';
        for (let i = 0; i < restUsers.length; i++) {
            socket.to(restUsers[i].socketId).emit('add_new_user', newRes)
        };
    });

    socket.on('sendMessage', data => {
        const user = findUser(data.receiverId);

        // console.log(data);

        if (user !== undefined) {
            socket.to(user.socketId).emit('getMessage', {
                uid: data.uid,
                senderId: data.senderId,
                senderName: data.senderName,
                receiverId: data.receiverId,
                receiverName: data.receiverName,
                createdAt: data.time,
                status: data.status,
                message: {
                    text: data.message,
                    image: data.image
                }
            })
        }
        // console.log('get', data);
    })

    socket.on('typing', data => {
        const user = findUser(data.receiverId);

        // console.log(data);

        if (user !== undefined) {
            socket.to(user.socketId).emit('getTyping', {
                senderId: data.senderId,
                receiverId: data.receiverId,
                message: data.message
            })
        }
    });

    socket.on('seenSMS', sms => {
        console.log('seen', sms);
        const user = findUser(sms.senderId);
        if (user !== undefined) {
            socket.to(user.socketId).emit('seenSmsRes', {
                ...sms,
                status: 'seen'
            })
        }
    });

    socket.on('deliveredSMS', sms => {
        console.log('delivered', sms);
        const user = findUser(sms.senderId);
        if (user !== undefined) {
            socket.to(user.socketId).emit('deliveredSmsRes', {
                ...sms,
                status: 'delivered'
            })
        }
    });

    socket.on('updateSeenSMS', sms => {
        console.log('updateSeenSMS', sms);
        const user = findUser(sms.senderId);
        if (user !== undefined) {
            socket.to(user.socketId).emit('updateSeenSMSRes', {
                ...sms,
                status: 'seen'
            })
        }
    });

    socket.on('logout', userInfo => {
        userLogout(userInfo.id);
    })

    socket.on('disconnect', () => {
        removeUser(socket.id);
        io.emit('getUser', users);
    })
});

// ------------------------------------ Start Server Code ------------------------ //

async function run() {
    try {
        await client.connect();
        const database = client.db('Messenger');
        const users = database.collection('users');
        const userLogin = database.collection('login');
        const sendMessage = database.collection('message');


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

            // console.log(req.body)

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
                    // console.log(token);

                    // const result = user;
                    // console.log(user);

                    const options = {
                        expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000)
                    }

                    res.json({
                        successMessage: 'Successfully Registered',
                        token
                    });

                    // res.json(token);

                    // try {

                    //     }
                    //     // console.log(error);

                    // } catch (error) {
                    //     error = "Internal server error";
                    //     res.json({ error });
                    // }

                }
            });


        // login post user
        app.post('/login', async (req, res) => {
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

                const checkUser = await users.findOne({ email: email });

                if (checkUser) {
                    const matchPassword = await bcrypt.compare(password, checkUser.password);
                    const isLoggedIn = await userLogin.findOne({ email: email });

                    if (matchPassword && !isLoggedIn) {

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
                        // console.log(result);

                        const options = {
                            expires: new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000)
                        }

                        res.json({
                            successMessage: 'Successfully Login',
                            token
                        });
                    } else if (!matchPassword && isLoggedIn) {
                        error = "Your password didn't match";
                        res.json({ error });
                    } else if (matchPassword && isLoggedIn) {
                        error = "You are already logged in";
                        res.json({ error });
                    }
                } else {
                    error = "Your email didn't find";
                    res.json({ error });
                }

                // try {

                // } catch (error) {
                //     error = "Internal Server Error";
                //     res.json({ error });
                // }
            }
        });

        // get friends
        app.get('/get-friends', async (req, res) => {

            // console.log('Body', req.body);

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
                // console.log(getAllMessage);
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
            const { senderId, senderName, receiverId, message, uid, status } = req.body;

            try {

                await sendMessage.insertOne({
                    uid,
                    senderId,
                    senderName,
                    receiverId,
                    createdAt: new Date(Date.now()),
                    status,
                    message: {
                        text: message,
                        image: ''
                    }
                });

                res.json({
                    success: true,
                    // message: newMessage
                    message: {
                        uid,
                        senderId,
                        senderName,
                        receiverId,
                        createdAt: new Date(Date.now()),
                        status,
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

        app.post('/image-message', async (req, res) => {
            const { senderId, senderName, receiverId, image, uid, status } = req.body;

            try {

                await sendMessage.insertOne({
                    uid,
                    senderId,
                    senderName,
                    receiverId,
                    createdAt: new Date(Date.now()),
                    status,
                    message: {
                        text: '',
                        image: image
                    }
                });

                res.json({
                    success: true,
                    // message: imgSMS
                    message: {
                        uid,
                        senderId,
                        senderName,
                        receiverId,
                        createdAt: new Date(Date.now()),
                        status,
                        message: {
                            text: '',
                            image: image
                        }
                    }
                })
            } catch (error) {
                res.json({ errorMessage: 'Internal Server Error' });
            }
        })


        app.put('/seen-sms', async (req, res) => {
            // console.log("Seen SMS Body: ", req.body.uid);
            try {
                const uidSMS = sendMessage.findOne({ uid: req.body.uid });

                if (uidSMS) {
                    const uid = req.body.uid;
                    const filter = { uid: uid };
                    const options = { upsert: true };
                    const updateDoc = {
                        $set: req.body,
                    };
                    const result = await sendMessage.updateOne(filter, updateDoc, options);
                    console.log("Seen Result: ", result);
                    res.json(result);
                } else {
                    console.log('wrong');
                }

            } catch (error) {
                console.log(error);
            }
        });

        app.delete('/logout/:id', async (req, res) => {
            // console.log('Logout', req.params.id);
            const id = req.params.id;
            const result = await userLogin.deleteOne({
                _id: ObjectId(id),
            });
            console.log('Logout result', result);
            res.send({
                successMessage: true
            })
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('ok');
});

http.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})