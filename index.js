// api.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const loginRoutes = require('./src/login');
const childRoutes = require('./src/child');
const photoRoutes = require('./src/photo');

require('dotenv').config();

let api = express();

api.use(cors());

// Rotes
api.use(loginRoutes);
api.use(childRoutes);
api.use(photoRoutes);

//Credencials
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.mrslfvp.mongodb.net/?retryWrites=true&w=majority`)
        .then(() => {
            api.listen(3000);
            console.log('conectou ao banco!');
        })
        .catch((err) => console.log(err));