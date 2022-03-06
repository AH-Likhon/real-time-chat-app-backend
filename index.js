const express = require('express');

const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
dotenv.config();
const PORT = process.env.PORT || 5000;


const databaseConnect = require('./config/database');
const authRouter = require('./routes/authRoute');
// const messengerRoute = require('./routes/messengerRoute');

databaseConnect();

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/messenger',authRouter);
// app.use('/api/messenger',messengerRoute);

app.get('/',(req,res)=>{
    res.send('ok');
})


app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})