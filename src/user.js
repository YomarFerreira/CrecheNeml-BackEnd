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

mongoose.set('debug', true);

let user = express();

//Config JSON response
user.use(express.json());

//Manage CORS requisition
user.use(cors());


//Config backend for upload files 
user.use(fileupload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'temp')
}));

//Models
const User = require('../models/User')

//Open Route - Public Route 
user.get('/',(req,res)=>{   
  res.status(200).json({ msg: "Bem Vindo a nossa API"})
});

//Private Route for User
user.get("/userauth/:id", checkToken, async (req, res) => {

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

//Route for one user
user.get("/user/:id", async (req, res) => {
    const id = req.params.id;

    try {
        // check if user exists
        const user = await User.findById(id, '-password');

        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrada!'});
        }
        res.status(200).json({ user });
    }catch (error){
        console.error("Erro ao obter usuário por ID:", error);
        res.status(500).json({ msg: 'Erro interno ao processar a solicitação' });
    }
});

// Route for all users
user.get("/users", async (req, res) => {
    try {
        const users = await User.find({}, '_id username role');
        res.status(200).json({ users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Aconteceu um erro no servidor' });
    }
});

//Register User
user.post('/auth/register', async(req, res) => {
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

//Update User
user.put('/auth/update/:id', async(req, res) => {
    const{_id, username,  password, confirmPassword, role} = req.body;

    if(!role || (role != 'admin' && role != 'user')){
        return res.status(422).json({ msg: 'Role deve ser preenchida com user ou admin'})
    }

    if (password !== confirmPassword) {
        return res.status(422).json({ msg: 'As senhas não conferem!'})
    }

    try {
        // check if user exists
        const existingUser = await User.findById(_id);
        if (!existingUser) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }

        // create user update object
        const userToUpdate = { username, role };

        // add password to update object only if it is provided
        if (password) {
            // create password hash
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash(password, salt);
            userToUpdate.password = passwordHash;
        }

        // update user
        await User.updateOne({ _id: existingUser._id }, { $set: userToUpdate });
        res.status(201).json({
            msg: 'Usuário atualizado com sucesso',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Aconteceu um erro no servidor',
        });
    }
});

// Delete User
user.delete('/auth/delete/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Find and delete usr by Id
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ msg: 'Usuário não encontrado!' });
        }

        res.status(200).json({ msg: 'Usuário excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir o usuário:', error);
        res.status(500).json({ msg: 'Erro interno ao processar a solicitação' });
    }
});



//Login User
user.post('/auth/login', async(req, res) => {
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
                username: user.username,
            },
            secret,
        )
        
        res.status(200).json({
            msg: 'Autenticação realizada com sucesso', token,
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

module.exports = user;