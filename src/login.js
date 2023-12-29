/* imports */
require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fileupload = require('express-fileupload');
const fs = require('fs');
const cors = require('cors');
let path = require('path');

let login = express();

//Config JSON response
login.use(express.json());

//Manage CORS requisition
login.use(cors());


//Config backend for upload files 
login.use(fileupload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'temp')
}));

//Models
const User = require('../models/User')

//Open Route - Public Route 
login.get('/',(req,res)=>{   
  res.status(200).json({ msg: "Bem Vindo a nossa API"})
});

//Private Route
login.get("/user/:id", checkToken, async (req, res) => {

    const id = req.params.id

    // check if user exists
    const user = await User.findById(id, '-password');

    if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado!'});
    }
    res.status(200).json({ user });
});

function checkToken(req, res, next){

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if (!token){
        return res.status(401).json({ msg: 'Acesso Negado'})
    }

    try{
        const secret = process.env.SECRET;
        jwt.verify(token, secret)

        req.user = decoded;

        next()
        
    }catch(error){
        console.log(error)
        res
        .status(400)
        .json({
            msg: 'Token Inválido!',
        })
    }
}

//Register User
login.post('/auth/register', async(req, res) => {
    const{username, role, password, confirmPassword} = req.body;

    //validations
    if(!username){
        return res.status(422).json({ msg: 'Login deve ser preenchido'})
    }
    if(!password){
        return res.status(422).json({ msg: 'Password deve ser preenchido'})
    }

    if(!role || (role != 'admin' && role != 'user')){
        return res.status(422).json({ msg: 'Role deve ser preenchida com user ou admin'})
    }

    if (password !== confirmPassword) {
        return res.status(422).json({ msg: 'As senhas não conferem!'})
    }

    // check if user exists
    const usernameExists = await User.findOne({ username: username})

    if (usernameExists) {
        return res.status(422).json({ msg: 'Username já cadastrado!'})
    }

    //create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //create user
    const user = new User({
        username,
        password: passwordHash,
        role: role
    })

    try{
        await user.save()
        res.status(201).json({
            msg: 'Usuario criado com sucesso',
        })
    }catch(error){
        console.log(error)
        res
        .status(500)
        .json({
            msg: 'Aconteceu um erro no servidor',
        })
    }
})

//Login User
login.post('/auth/login', async(req, res) => {
    const{username, password} = req.body;

    //validations
    if(!username){
        return res.status(422).json({ msg: 'Username deve ser preenchido'})
    }
    if(!password){
        return res.status(422).json({ msg: 'Password deve ser preenchido'})
    }

    // check if user exists
    const user = await User.findOne({ username: username})

    if (!user) {
        return res.status(404).json({ msg: 'Username não encontrado!'})
    }

    //check if password match
    const checkPassword = await bcrypt.compare(password, user.password)
    
    if(!checkPassword){
        return res.status(422).json({ msg: 'Senha inválida!'})
    }    


    try{
        const secret = process.env.SECRET
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            secret,
        )
        
        res.status(200).json({
            msg: 'Autenticação realizada com sucesso', token
        })
    }catch(error){
        console.log(error)
        res
        .status(500)
        .json({
            msg: 'Aconteceu um erro no servidor',
        })
    }
});

module.exports = login;