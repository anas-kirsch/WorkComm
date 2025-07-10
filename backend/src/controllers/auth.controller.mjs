
import getClientTokenAndVerifAccess from "../middlewares/getClientTokenAndVerifAccess.mjs"
import { findUserByMail } from "../models/auth.model.mjs";
import { getProfilPictureFromDataB } from "../controllers/getAndSaveProfilPicture.mjs"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const secret = process.env.JWT_SECRET || "secret-key"; // à adapter selon ton projet


export class authController {


    /**
     * Cette methode static permet à un utilisateur de se connecter 
     * @param {*} request 
     * @param {*} response 
     * @returns 
     */
    static async login(request, response) {
        try {

            console.log('route : login');

            const UserData = request.body;
            // console.log(UserData);

            // ...existing code...
            if (!UserData || !UserData.mail || !UserData.password) {
                return response.status(400).json({ error: "Données manquantes." });
            }
            else {
                // console.log(UserData.mail)
                // console.log(UserData.password)

                const getUserConnect = await findUserByMail(UserData.mail);

                if (!getUserConnect) {
                    return response.status(400).json({ error: "Identifiants invalides." });

                } else {
                    console.log("myUser:", getUserConnect.dataValues)

                    const compareMdp = await bcrypt.compare(UserData.password, getUserConnect.dataValues.password)
                    // console.log("test comparaison",compareMdp)

                    if (!compareMdp) {
                        return response.status(400).json({ error: "Identifiants invalides." });
                    }

                    if (compareMdp === true) {
                        console.log("connection autorisée", compareMdp)

                        // fournir user , donc ces donnee , username, mail, pp, bio, language, id
                        //fournir le jwt 
                        const profilPicture = await getProfilPictureFromDataB(getUserConnect.dataValues.id);

                        if (profilPicture) {
                            console.log(profilPicture)
                        }
                        if (!profilPicture) {
                            // console.log("impossible de recupérer la pp de l'utilisateur. ")
                        }

                        //envoyer un jwt au client qui s'est connecté
                        const payload = { id: getUserConnect.dataValues.id, role: getUserConnect.dataValues.role }
                        const newToken = jwt.sign(payload, secret, {
                            expiresIn: "30 days"
                        })

                        const user = {
                            id: getUserConnect.dataValues.id,
                            username: getUserConnect.dataValues.username,
                            mail: getUserConnect.dataValues.mail,
                            language: getUserConnect.dataValues.language,
                            bio: getUserConnect.dataValues.bio,
                            imagePath: profilPicture,
                            token: newToken,
                            role: getUserConnect.dataValues.role

                        }
                        console.log(user)
                        response.status(200).json({
                            message: "connection autorisée",
                            body: user
                        })

                    } else {
                        console.log("connection refusée", compareMdp)
                        return response.status(400).json({ error: "Erreur dans le mot de passe" })
                    }
                }

            }
        } catch (error) {
            console.error(error); // pour le voir dans la console
            response.status(500).json({ error: "Erreur serveur lors de l'inscription." });

        }
    }























}