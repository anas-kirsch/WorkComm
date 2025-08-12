
import getClientTokenAndVerifAccess from "../middlewares/getClientTokenAndVerifAccess.mjs"
import { findUserByMail, updateUserResetToken } from "../models/auth.model.mjs";
import { getProfilPictureFromDataB } from "../controllers/getAndSaveProfilPicture.mjs"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateResetLink } from "../controllers/generateResetLink.controller.mjs"
import { emailResetPassword } from "../controllers/smtp.controller.mjs"
import {premiumIsTrue} from "../models/paiement.model.mjs"
import { User } from "../models/database.mjs";

const secret = process.env.JWT_SECRET || "secret-key"; 

export class authController {


    /**
     * Cette methode static permet à un utilisateur de se connecter 
     * @param {*} request 
     * @param {*} response 
     * @returns 
     */
    static async login(request, response) {
        try {
            const UserData = request.body;

            if (!UserData || !UserData.mail || !UserData.password) {
                return response.status(400).json({ error: "Données manquantes." });
            }
            else {
                const getUserConnect = await findUserByMail(UserData.mail);
                if (!getUserConnect) {
                    return response.status(400).json({ error: "Identifiants invalides." });

                } else {
                    console.log("myUser:", getUserConnect.dataValues)

                    const compareMdp = await bcrypt.compare(UserData.password, getUserConnect.dataValues.password)

                    if (!compareMdp) {
                        return response.status(400).json({ error: "Identifiants invalides." });
                    }

                    if (compareMdp === true) {
                        console.log("connection autorisée", compareMdp)
                        const profilPicture = await getProfilPictureFromDataB(getUserConnect.dataValues.id);

                        if (profilPicture) {
                            console.log(profilPicture)
                        }
                        if (!profilPicture) {
                            console.log("impossible de recupérer la pp de l'utilisateur. ")
                        }

                        const getPremiumStatus = await premiumIsTrue(getUserConnect.dataValues.id)
                        if(!getPremiumStatus){
                            console.error("error dans la recuperation du status de l'abonnement de l'utilisateur", getPremiumStatus)
                        }

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
                            role: getUserConnect.dataValues.role,
                            premium : getPremiumStatus.dataValues.premium
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


    /**
     * cette methode static permet à un utilisateur de demander la réinitialisation de son mot de passe 
     */
    static async resetPassword(request, response) {
        try {
            const { mail } = request.body;
            if (!mail) {
                return response.status(400).json({ error: "Email manquant." });
            }
            const user = await findUserByMail(mail);
            if (!user) {
                return response.status(404).json({ error: "Utilisateur non trouvé." });
            }

            const baseUrl = process.env.RESET_URL || "http://localhost:4900/reset-password";
            const { token, link } = generateResetLink(baseUrl);

            await updateUserResetToken(user.dataValues.id, token);
            await emailResetPassword(user.dataValues.username, mail, link);

            response.status(200).json({ message: "Email de réinitialisation envoyé." });
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur lors de la demande de réinitialisation." });
        }
    }



    /**
     * cette methode static permet à un utilisateur d'entrer un mot de passe pour qui soit bien réinitialiser en bdd
     * @returns 
     */
    static async passwordUpdater(request, response) {
        try {
            const { newPassword, newConfirmedPassword, token } = request.body;

            if (!newPassword || !newConfirmedPassword || !token) {
                return response.status(400).json({ error: "Données manquantes." });
            }
            if (newPassword !== newConfirmedPassword) {
                return response.status(400).json({ error: "Les mots de passe ne correspondent pas." });
            }

            const user = await User.findOne({ where: { resetToken: token } });
            if (!user) {
                return response.status(400).json({ error: "Lien de réinitialisation invalide ou expiré." });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await User.update(
                { password: hashedPassword, resetToken: null },
                { where: { id: user.id } }
            );

            response.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur lors de la réinitialisation du mot de passe." });
        }
    }


}