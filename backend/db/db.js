const mongoose = require("mongoose");

const db = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MONGODB CONNECTED`);
    } catch (error) {
        console.log(`\nMONGODB ERROR:\n ${error}`);
        process.exit(1);
    }
};

module.exports = db;