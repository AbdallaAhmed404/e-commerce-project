const mongoose = require('mongoose');

const connect = async () => {
    try {
        await mongoose.connect('mongodb+srv://Kagi:Kagi@cluster0.fa4xu0a.mongodb.net/commerce?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Atlas connected successfully');
    } catch (err) {
        console.error('Error connecting to MongoDB Atlas:', err.message);
    }
};

module.exports = connect;
