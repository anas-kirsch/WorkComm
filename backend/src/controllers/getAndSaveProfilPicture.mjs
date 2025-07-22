import { response } from 'express';
import { profilPicture } from '../models/database.mjs';
import { sequelize } from "../configs/dbConnect.mjs";
import { error } from 'console';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url); // Chemin complet du fichier courant
const __dirname = path.dirname(__filename);
/**
 * Cette fonction prend en paramètre une image envoyée par le client lors de la création de son compte ou s'il souhaite la modifier.
 * @param {import('express-fileupload').UploadedFile} picture - L'image envoyée par le client
 * @param {number} userId l'identifiant de l'user qui a enregistrer une image pour la mettre dans la bdd profilPicture
 */
export async function getAndSaveProfilPicture(picture, userId) {

    try {

        if (picture == "null") {
            console.log("l'utilisateur n'a pas ajouter de photo de profil", picture)

            // Enregistre le chemin par défaut vers default.jpg
            const saveDefaultPicturePathToBdd = await profilPicture.upsert({
                UserId: userId,
                imagePath: `http://localhost:4900/images/default.jpg`
            });
            return saveDefaultPicturePathToBdd;

        } else {

            const extensionFile = picture.name.split(".").pop()?.toLowerCase();
            const fileName = picture.name
                .split(".")[0]
                .toLowerCase()
                .replace(/[ ,]+/g, '-')        // espaces et virgules en tirets
                .replace(/[^a-z0-9-_]/g, ''); // retire autres caractères spéciaux

            const completeFileName = `${fileName}_${Date.now()}.${extensionFile}`;
            // console.log("extension ---> : ", extensionFile);

            if (!['jpg', 'jpeg', 'png', 'gif'].includes(extensionFile)) {
                // console.error("Le format de l'image n'est pas supporté. Veuillez utiliser jpg, jpeg, png ou gif.");
                throw new Error("Le format de l'image n'est pas supporté. Veuillez utiliser jpg, jpeg, png ou gif.");
                return;
            }

            // J'utilise la fonction mv() pour uploader le fichier
            // dans le dossier /public du répértoire courant
            console.log(__dirname)
            const pathPicture = `${__dirname}/../../public/images/${completeFileName}`;
            console.log(pathPicture)
            const savePicture = await picture.mv(pathPicture);

            const savePicturePathToBdd = await profilPicture.upsert({
                UserId: userId,
                imagePath: `http://localhost:4900/images/${completeFileName}`
            })
            return savePicturePathToBdd
        }
    } catch (error) {
        console.error(error);
        return response.status(500).json("erreur serveur.")
    }

}


/**
 * cette fonction permet de recuperer la photo de profil d'un utilisateur en fonction de l'id fourni 
 * @param {number} id l'id de l'user 
 */
export async function getProfilPictureFromDataB(id) {
    try {
        console.log(id);
        const getProfilPicture = await profilPicture.findOne({ where: { UserId: id } })

        if (!getProfilPicture) {
            console.log(`impossible de recuperer la photo de profil de l'user ${id}`)
            return;
        }
        console.log({ result: getProfilPicture.dataValues.imagePath });


        return getProfilPicture;
    } catch (error) {
        console.error(error);
    }

}