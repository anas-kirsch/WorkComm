import { response } from 'express';
import { User_images } from '../database.mjs';
import { sequelize } from "../database.mjs";

/**
 * Cette fonction prend en paramètre une image envoyée par le client lors de la création de son compte ou s'il souhaite la modifier.
 * @param {import('express-fileupload').UploadedFile} picture - L'image envoyée par le client
 * @param {number} userId l'identifiant de l'user qui a enregistrer une image pour la mettre dans la bdd User_images
 */
export async function getAndSaveProfilPicture(picture, userId) {

    try {

        // Je forme un nom unique pour le fichier, cette étape n'est pas obligatoire.
        const extensionFile = picture.name.split(".")[1];
        const fileName = picture.name.split(".")[0];
        const completeFileName = `${fileName}_${Date.now()}.${extensionFile}`;

        // J'utilise la fonction mv() pour uploader le fichier
        // dans le dossier /public du répértoire courant
        const savePicture = await picture.mv(`../public/images/${completeFileName}`);
        const pathPicture = `../public/images/${completeFileName}`;

        const savePicturePathToBdd = await User_images.upsert({
            UserId: userId,
            imagePath: pathPicture
        })
            return savePicturePathToBdd
    } catch (error) {
        console.error(error);
    }

}


/**
 * cette fonction permet de recuperer la photo de profil d'un utilisateur en fonction de l'id fourni 
 * @param {number} id l'id de l'user 
 */
export async function getProfilPictureFromDataB(id) {
    
    






}