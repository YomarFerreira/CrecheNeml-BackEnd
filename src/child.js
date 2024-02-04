/* imports */
require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const cors = require('cors');

mongoose.set('debug', true);

let child = express();

//Config JSON response
child.use(express.json());

//Manage CORS requisition
child.use(cors());

//Models
const Child = require('../models/Child');

//Route for one children
child.get("/child/:id", async (req, res) => {
    const id = req.params.id;

    try {
        // check if child exists
        const child = await Child.findById(id);

        if (!child) {
            return res.status(404).json({ msg: 'Criança não encontrada!'});
        }
        res.status(200).json({ child });
    }catch (error){
        console.error("Erro ao obter criança por ID:", error);
        res.status(500).json({ msg: 'Erro interno ao processar a solicitação' });
    }

});

    
// Route for all childrens
child.get("/childrens", async (req, res) => {
    try {
        const children = await Child.find();
        res.status(200).json({ children });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Aconteceu um erro no servidor' });
    }
});


// Route for delete children
child.delete("/delete/:id", async (req, res) => {
    const id = req.params.id;

    try{
        const childExists = await Child.findById(id);

        if (!childExists) {
            return res.status(404).json({ msg: 'Criança não encontrada!'});
        }

        await Child.findByIdAndDelete(id);

        res.status(200).json({ msg: 'Criança excluída com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Erro interno ao processar a solicitação' });
    }
});


// Route for update children
child.put('/child/update/:id', async(req, res) => {
    const{_id, name, sex, classChild, birthDate, photograph, personalDocument, address, addressNumber, addressComplement, addressNeighborhood,
          addressMunicipality, addressZip, addressUF, telephone, responsible1, parentageResponsible1, telephoneResponsible1, responsible2,
          parentageResponsible2, telephoneResponsible2, allergenic, comments} = req.body;

  //validations
  if(!name){return res.status(422).json({ msg: 'O campo Nome deve ser preenchido'})}
  if(!sex){return res.status(422).json({ msg: 'O campo Sexo deve ser preenchido'})}
  //if(!classChild){return res.status(422).json({ msg: 'O campo Classe deve ser preenchido'})}
  if(!birthDate){return res.status(422).json({ msg: 'O campo Data de Nascimento deve ser preenchido'})}
  //if(!photograph){return res.status(422).json({ msg: 'O campo Fotografia deve ser preenchido'})}
  //if(!personalDocument){return res.status(422).json({ msg: 'O campo CPF deve ser preenchido'})}
  if(!address){return res.status(422).json({ msg: 'O campo Endereço Logradouro deve ser preenchido'})}
  if(!addressNumber){return res.status(422).json({ msg: 'O campo N&deg; Logradouro deve ser preenchido'})}
  //if(!addressComplement){return res.status(422).json({ msg: 'O campo Complemento deve ser preenchido'})}
  if(!addressNeighborhood){return res.status(422).json({ msg: 'O campo Bairro deve ser preenchido'})}
  if(!addressMunicipality){return res.status(422).json({ msg: 'O campo Minicípio deve ser preenchido'})}
  if(!addressZip){return res.status(422).json({ msg: 'O campo Cep deve ser preenchido'})}
  if(!addressUF){return res.status(422).json({ msg: 'O campo UF deve ser preenchido'})}
  if(!telephone){return res.status(422).json({ msg: 'O campo Telefone deve ser preenchido'})}
  if(!responsible1){return res.status(422).json({ msg: 'O campo Responsável1 deve ser preenchido'})}
  if(!parentageResponsible1){return res.status(422).json({ msg: 'O campo Parentesco Responsável1 deve ser preenchido'})}
  if(!telephoneResponsible1){return res.status(422).json({ msg: 'O campo Telefone Responsável1 deve ser preenchido'})}
  if(!responsible2){return res.status(422).json({ msg: 'O campo Responsável2 deve ser preenchido'})}
  if(!parentageResponsible2){return res.status(422).json({ msg: 'O campo Parentesco Responsável2 deve ser preenchido'})}
  if(!telephoneResponsible2){return res.status(422).json({ msg: 'O campo Telefone Responsável 2 deve ser preenchido'})}
  //if(!allergenic){return res.status(422).json({ msg: 'O campo Alergênico deve ser preenchido'})}
  //if(!comments){return res.status(422).json({ msg: 'O campo Observações deve ser preenchido'})}

  // check if children exists
  const childrenExists = await Child.findOne({ personalDocument: personalDocument})

  if (personalDocument !== null && personalDocument !== '' && childrenExists && childrenExists._id.toString() !== _id) {
    return res.status(422).json({ msg: 'CPF já cadastrado!'})
  }

  //create children
  const ChildToUpdate = {
      name, sex, classChild, birthDate, photograph, personalDocument, address, addressNumber, addressComplement, addressNeighborhood,
      addressMunicipality, addressZip, addressUF, telephone, responsible1, parentageResponsible1, telephoneResponsible1, responsible2,
      parentageResponsible2, telephoneResponsible2, allergenic, comments
  };

  try{
      await Child.updateOne({ _id: _id }, { $set: ChildToUpdate});
      res.status(201).json({
          msg: 'Child atualizado com sucesso',
          child: ChildToUpdate
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


//Register Children
child.post('/child/register', async(req, res) => {
      const{name, sex, classChild, birthDate, photograph, personalDocument, address, addressNumber, addressComplement, addressNeighborhood,
            addressMunicipality, addressZip, addressUF, telephone, responsible1, parentageResponsible1, telephoneResponsible1, responsible2,
            parentageResponsible2, telephoneResponsible2, allergenic, comments} = req.body;

    //validations
    if(!name){return res.status(422).json({ msg: 'O campo Nome deve ser preenchido'})}
    if(!sex){return res.status(422).json({ msg: 'O campo Sexo deve ser preenchido'})}
    //if(!classChild){return res.status(422).json({ msg: 'O campo Classe deve ser preenchido'})}
    if(!birthDate){return res.status(422).json({ msg: 'O campo Data de Nascimento deve ser preenchido'})}
    //if(!photograph){return res.status(422).json({ msg: 'O campo Fotografia deve ser preenchido'})}
    //if(!personalDocument){return res.status(422).json({ msg: 'O campo CPF deve ser preenchido'})}
    if(!address){return res.status(422).json({ msg: 'O campo Endereço Logradouro deve ser preenchido'})}
    if(!addressNumber){return res.status(422).json({ msg: 'O campo N&deg; Logradouro deve ser preenchido'})}
    //if(!addressComplement){return res.status(422).json({ msg: 'O campo Complemento deve ser preenchido'})}
    if(!addressNeighborhood){return res.status(422).json({ msg: 'O campo Bairro deve ser preenchido'})}
    if(!addressMunicipality){return res.status(422).json({ msg: 'O campo Minicípio deve ser preenchido'})}
    if(!addressZip){return res.status(422).json({ msg: 'O campo Cep deve ser preenchido'})}
    if(!addressUF){return res.status(422).json({ msg: 'O campo UF deve ser preenchido'})}
    if(!telephone){return res.status(422).json({ msg: 'O campo Telefone deve ser preenchido'})}
    if(!responsible1){return res.status(422).json({ msg: 'O campo Responsável1 deve ser preenchido'})}
    if(!parentageResponsible1){return res.status(422).json({ msg: 'O campo Parentesco Responsável1 deve ser preenchido'})}
    if(!telephoneResponsible1){return res.status(422).json({ msg: 'O campo Telefone Responsável1 deve ser preenchido'})}
    if(!responsible2){return res.status(422).json({ msg: 'O campo Responsável2 deve ser preenchido'})}
    if(!parentageResponsible2){return res.status(422).json({ msg: 'O campo Parentesco Responsável2 deve ser preenchido'})}
    if(!telephoneResponsible2){return res.status(422).json({ msg: 'O campo Telefone Responsável 2 deve ser preenchido'})}
    //if(!allergenic){return res.status(422).json({ msg: 'O campo Alergênico deve ser preenchido'})}
    //if(!comments){return res.status(422).json({ msg: 'O campo Observações deve ser preenchido'})}


    // check if user exists
    const childrenExists = await Child.findOne({ personalDocument: personalDocument})

    if (personalDocument !== null && personalDocument !== '' && childrenExists) {
        return res.status(422).json({ msg: 'CPF já cadastrado!'})
    }

    //create user
    const child = new Child({
        name, sex, classChild, birthDate, photograph, personalDocument, address, addressNumber, addressComplement, addressNeighborhood,
        addressMunicipality, addressZip, addressUF, telephone, responsible1, parentageResponsible1, telephoneResponsible1, responsible2,
        parentageResponsible2, telephoneResponsible2, allergenic, comments
    })

    try{
        await child.save()
        res.status(201).json({
            msg: 'Child criado com sucesso',
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

module.exports = child;