const mongoose = require('mongoose');
const uri = process.env.DB_URL;
const connectTMongo = async () => {
  try {
    await mongoose
      .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('Database connected successfully');
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectTMongo;
