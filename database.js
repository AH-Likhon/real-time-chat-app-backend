const mongoose = require('mongoose');

const databaseConnect = () => {
    mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q3g5t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, { useNewUrlParser: true, 
    useUnifiedTopology: true, 
    // useCreateIndex: true 
}).then(() => {
    console.log('Connected This server');
}).catch(error => {
    console.log(error);
})
}

module.exports = databaseConnect;