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
        const database = client.db('New-Messenger');
        const users = database.collection('users');

        // insert user
        app.post('/users', async (req, res) => {
        
            const {
                userName,
                email,
                password,
                confirmPassword, 
                image
            } = req.body;

            const error = [];

            if (!userName) {
                error.push('please provide your user name');
                // res.json({ error });
            }
            if (!email) {
                error.push('please provide your email');
            }
            if (email && !validator.isEmail(email)) {
                error.push('please provide your valid email');
            }
            if (!password) {
                error.push('please provide your password');
            }
            if (!confirmPassword) {
                error.push('please provide user confirm password');
            }
            if (password && confirmPassword && password !== confirmPassword) {
                error.push('your password and confirm password not same');
            }
            if (password && password.length < 6) {
                error.push('please provide password must be 6 charecter');
            }
            if (!image) {
                error.push('please provide user image');
            }
            if (error.length > 0) {
                res.json({ error })
            } else {

                    
                try {
                    const checkUser = await users.findOne({ email: email });
                    console.log(checkUser);

                    if(checkUser){
                        error.push("Your email is already registered");
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
                        const options = {
                            expires : new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000)
                        }

                        const result = user;
                        console.log(result);

                        res.cookie('authToken', result, options).json(user)

                        // res.json(token);
                    }
                    console.log(error);

                } catch (error) {
                    res.status(500).json({
                                    error: {
                                        errorMessage: ['Internal server error']
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