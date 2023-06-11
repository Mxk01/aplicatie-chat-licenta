
const mongoose = require('mongoose');

let cachedConnection = null;

const connectToDatabase = async () => {
  if (cachedConnection) {
    console.log('Using cached database connection');
    return cachedConnection;
  }

  try {
    const connection =  mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    cachedConnection = connection;
    console.log('New database connection established');
    return connection;
  } catch (error) {
    console.error('Failed to connect to database', error);
    throw error;
  }
};

module.exports = { connectToDatabase };
