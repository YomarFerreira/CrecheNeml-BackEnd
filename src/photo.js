/* imports */
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 },
});

mongoose.set('debug', true);

let photo = express();

//Config JSON response
photo.use(express.json({ limit: '2mb' }));
photo.use(express.urlencoded({ limit: '2mb', extended: true }));

//Models
const Child = require('../models/Child');
const Photo = require('../models/Photo');
const { isNull } = require('util');


//Rote for post file
photo.post('/photo/:id', upload.single('file'), async (req, res, next) => {
    const fileSize = req.headers['content-length'];
    const typeFile = req.headers['content-type'];
  
    try {
        const id = req.params.id;
        const file = req.files.file;

        if (!file) {
            return res.status(400).json({ msg: 'Nenhum arquivo enviado.' });
        }

        let newName = `child_${id}.jpg`;
        let idForDelete = null;
        const existingPhoto = await Photo.findOne({ name : newName });
        if (existingPhoto) {
            idForDelete = existingPhoto._id;
        }

        const photo = new Photo({
            name: newName,
            base64Data: Buffer(fs.readFileSync(file.tempFilePath)).toString('base64'),
        });

        const savedPhoto = await photo.save();

        await Child.findByIdAndUpdate(id, { photograph: savedPhoto._id });

        if (idForDelete) {
            await Photo.findByIdAndDelete(idForDelete);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Erro no envio do arquivo:', error);
        res.status(500).json({ error: 'Erro interno ao processar a solicitação' });
    }

});


//Rote for get file
photo.get('/photo/details/:photographId', async (req, res) => {
    try {
        const photographId = req.params.photographId.toLowerCase();
        let photo;
        if (photographId !== 'default') {
            photo = await Photo.findById(photographId);
        }

        if (!photo || photographId === 'default') {
            const defaultPhoto = await Photo.findOne({ name: 'default.jpg' });
            if (!defaultPhoto) {
                throw new Error('Foto padrão não encontrada.');
            }
            return res.json(defaultPhoto.base64Data);
        }
        return res.json(photo.base64Data);
    } catch (error) {
        console.error('Erro ao buscar detalhes da foto:', error);
        res.status(500).json({ error: 'Erro interno ao processar a solicitação' });
    }
});

module.exports = photo;