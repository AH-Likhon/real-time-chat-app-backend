const express = require('express');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
dotenv.config();
const { MongoClient } = require('mongodb');
const PORT = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q3g5t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(bodyParser.json());
app.use(cookieParser());

async function run() {
    try {
        await client.connect();
        const database = client.db('Messenger');
        const users = database.collection('users');


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

            let error = "";

            if ( !userName || !email || !password || !confirmPassword || !image ) {
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
            if ( userName && email && !password && confirmPassword && image ) {
                error = 'please provide your password';
                // res.json({ error })
            }
            if ( userName && email && password && !confirmPassword && image) {
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
            if ( userName && email && password && confirmPassword && !image ) {
                error = 'please provide your image';
                // res.json({ error })
            }
            
            if(error){
                res.json({ error });
            } else {
                    
                try {
                    const checkUser = await users.findOne({ email: email });
                    console.log(checkUser);

                    if(checkUser){
                        error = "Your email is already registered";
                        res.json({ error });
                    }else{
                        const user = await users.insertOne({
                                        userName,
                                        email,
                                        password: await bcrypt.hash(password, 10),
                                        image,
                                        expires : new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000),
                                        registerTime: new Date()
                        });

        

                        // console.log(token);

                        // const result = user;
                        console.log(user);

                        // const token = jwt.sign({
                        //         id: user._id,
                        //         email: user.email,
                        //         userName: user.userName,
                        //         image: user.image,
                        //         registerTime: user.registerTime
                        //     }, process.env.SECRET, {
                        //         expiresIn: process.env.TOKEN_EXP
                        //     });

                        // res.send(token);
                        const options = {
                            expires : new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000)
                        }

                        res.cookie('authToken', user, options).json(user);

                        // res.json(token);
                    }
                    console.log(error);

                } catch (error) {
                    res.status(500).json({
                                    error: {
                                        errorMessage: 'Internal server error'
                                    }
                                })
                }               

            }
        });
        
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('ok');
})


app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})