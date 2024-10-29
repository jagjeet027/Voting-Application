const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const connectDB = require('./db');

connectDB();
app.use(bodyParser.json());
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
const candidatesRoutes = require('./routes/candidatesRoutes');

// const { jwtAuthMiddleware} = require('./jwt.js');

app.use('/user', userRoutes);
app.use('/candidate', candidatesRoutes);


const PORT = process.env.PORT || 9472;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
