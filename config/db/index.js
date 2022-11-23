const mongoose = require('mongoose');
// mongoose.set('useFindAndModify', false);
async function connect(){
    try {
        await mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex : true
        });
        console.log('true')
    } catch (error) {
        console.log('false')
    }
}

module.exports = {connect};