import { Op, Sequelize } from "sequelize";
import express, { request, response } from "express";
import cors from "cors";
import { sequelize } from "./database.mjs";
import { User } from "./database.mjs";
// import {AdminUser} from "./database.mjs"
import { Friends } from "./database.mjs";
import bcrypt from "bcrypt";
import { getAndSaveProfilPicture } from "./models/getAndSaveProfilPicture.mjs";
import parseFormData from '@trojs/formdata-parser';
import fileUpload from "express-fileupload";
import { profilPicture } from "./database.mjs";
import { get } from "http";
import { getProfilPictureFromDataB } from "./models/getAndSaveProfilPicture.mjs"
import jwt from "jsonwebtoken"
import { getClientTokenAndVerifAccess } from "./models/getClientTokenAndVerifAccess.mjs";
import fs from "fs/promises";


const secret = process.env.SECRET_KEY ?? "secret-key";


/**
 * 
 * @param {Sequelize} sequelize 
 */
export function runServer(sequelize) {
    const app = express();
    const port = 4900;
    app.use(cors());

    app.use(express.static("../public"));

    app.use(express.json());
    // app.use(fileUpload({
    //     limits: { fileSize: 2 * 1024 * 1024 },
    // }));
    app.use(fileUpload());

    /**
     * Cette route est la home page du site OK
     */
    app.get('/home', (request, response) => {

        try {
            console.log("route : home")

            // devra renvoyer la page d'accueil au client
            response.json('<h1>home page </h1>')


        } catch (error) {
            response.status(500)
            response.json('Access denied to /home')
        }

    })

    /**
     * Cette route permet au client de se creer un compte OK
     */
    app.post('/register', async (request, response) => {
        try {
            console.log("route : register")
            const myNewUser = request.body;
            // console.log("1", myNewUser);
            if (!myNewUser) {
                return response.status(400).json({ error: "Données manquantes." });
            }
            const ifUserExist = await User.findOne({ where: { username: myNewUser.username } });

            if (ifUserExist) {

                console.log(`l'user ${myNewUser.username} existe deja, essayez un autre nom d'utilisateur. `)
                return response.status(400).json(`l'user ${myNewUser.username} existe deja !`)
            }

            if (myNewUser) {
                if (myNewUser.password != myNewUser.confirmPassword) {
                    return response.status(400).json({ error: "Les mots de passe ne correspondent pas." });

                } else {

                    const validUser = {
                        username: myNewUser.username,
                        mail: myNewUser.mail,
                        role: myNewUser.role,
                        language: myNewUser.language,
                        bio: myNewUser.bio,
                        password: myNewUser.password

                    }
                    console.log("2", validUser)

                    const insertNewUser = await User.create({
                        username: validUser.username,
                        mail: validUser.mail,
                        role: validUser.role,
                        language: validUser.language,
                        bio: validUser.bio,
                        password: validUser.password,
                    });
                    console.log('3:', insertNewUser)

                    if (insertNewUser) {

                        console.log("test file", request.files);

                        if (request.files || request.files == null) {

                            if (request.files && request.files.picture.size > 2 * 1024 * 1024) {
                                const getUserToDestroy = await User.findOne({ where: { id: insertNewUser.id } })
                                const deleteUserBecauseError = getUserToDestroy.destroy();
                                return response.status(400).json({
                                    message: "erreur la photo est trop grande"
                                });

                            }

                            let picture = "null";

                            if (request.files) {
                                picture = request.files.picture;
                            }

                            const addPic = await getAndSaveProfilPicture(picture, insertNewUser.id)

                            if (addPic) {
                                response.status(200).json({
                                    message: 'votre user a bien été créer',
                                    user: {
                                        userId: insertNewUser.id,
                                        username: insertNewUser.username,
                                        mail: insertNewUser.mail
                                    }

                                })
                            }
                            else {
                                const getUserToDestroy = await User.findOne({ where: { id: insertNewUser.id } })
                                const deleteUserBecauseError = getUserToDestroy.destroy();
                                return response.status(400).json({ error: "Erreur lors de l'ajout de la photo de profil." });
                            }
                        }

                    }
                }
            }

        } catch (error) {
            if (error.message.includes("taille maximale autorisée")) {
                response.status(400).json({ error: error.message });
            }
            else if (error.message.includes("Le format de l'image n'est pas supporté")) {
                response.status(400).json({ error: error.message });
            } else {

                console.error(error); // pour le voir dans la console
                response.status(500).json({ error: "Erreur serveur lors de l'inscription." });
            }
        }


    })

    /**
     * cette route permet de se connecter et renvoie un jwt
     */
    app.post('/login', async (request, response) => {

        try {


            console.log('route : login');

            const UserData = request.body;
            // console.log(UserData);


            if (!UserData) {
                return response.status(400).json({ error: "Données manquantes." });
            }
            else {
                console.log(UserData.mail)
                console.log(UserData.password)
                // response.send("bienvenue")

                // const userPasswordHashed = bcrypt.compare();

                const getUserConnect = await User.findOne({ where: { mail: UserData.mail } });

                if (!getUserConnect) {
                    return response.status(400).json({ error: "Utilisateur introuvable." });

                } else {
                    console.log("myUser:", getUserConnect.dataValues)

                    const compareMdp = await bcrypt.compare(UserData.password, getUserConnect.dataValues.password)
                    // console.log("test comparaison",compareMdp)

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
                            token: newToken

                        }
                        console.log(user)
                        response.status(200).json({
                            message: "connection autorisée",
                            body: user
                        })

                    } else {
                        console.log("connection refusée", compareMdp)
                        return response.status(400).json("erreur dans le mot de passe")
                    }
                }

            }


        } catch (error) {
            console.error(error); // pour le voir dans la console
            response.status(500).json({ error: "Erreur serveur lors de l'inscription." });

        }

    })


    // /**
    //  * Cette route permet d'ajouter un administrateur, plus tard elle sera ferme
    //  */
    // app.post('/admin-register',async(request,response)=>{

    //     try {

    //         console.log("route : admin-register")

    //         const myNewAdmin = request.body;
    //         console.log("1", myNewAdmin);

    //         if (!myNewAdmin) {
    //             return response.status(400).json({ error: "Données manquantes." });
    //         }

    //         if (myNewAdmin) {
    //             if (myNewAdmin.password != myNewAdmin.confirmPassword) {
    //                 return response.status(400).json({ error: "Les mots de passe ne correspondent pas." });

    //             } else {

    //                 const ValidAdmin = {
    //                     username: myNewAdmin.username,
    //                     mail: myNewAdmin.mail,
    //                     password: myNewAdmin.password
    //                 }
    //                 console.log("2", ValidAdmin)

    //                 const insertNewAdmin = await AdminUser.create({
    //                     username: ValidAdmin.username,
    //                     mail: ValidAdmin.mail,
    //                     password: ValidAdmin.password,
    //                 });
    //                 console.log('3:', insertNewAdmin);

    //                 if (insertNewAdmin) {

    //                     response.status(200).send({
    //                         message: 'votre admin a bien été créer',
    //                         user: {
    //                             username: insertNewAdmin.username,
    //                             mail: insertNewAdmin.mail
    //                         }

    //                     });

    //                 };

    //             };
    //         };

    //     } catch (error) {
    //         console.error(error); // pour le voir dans la console
    //         response.status(500).json({ error: "Erreur serveur lors de l'inscription." });
    //     }

    // })


    /**
     * cette route doit permettre a l'admin de supprimer des utilisateur 
     */
    // app.delete


    /**
     * cette route doit permettre a un utilisateur de supprimer son compte  OK
     */
    app.delete('/delete/user/:userId', getClientTokenAndVerifAccess, async (request, response) => {

        try {

            const { userId } = request.params;

            const getUserToDelete = await User.findByPk(userId);
            // console.log(getUserToDelete);

            const getPicUser = await profilPicture.findOne({ where: { UserId: userId } });
            console.log("------>", getPicUser)

            const getHisFriends = await Friends.findAll({
                where: { [Op.or]: { UserId: userId, friendId: userId } }
            })


            if (getUserToDelete && getPicUser) {
                await getUserToDelete.destroy();
                await getPicUser.destroy();

                const imagePath = getPicUser.imagePath;
                const pathFile = "/images" + imagePath.split("/images").pop();
                console.log(pathFile);

                try {
                    await fs.unlink(`../public${pathFile}`);
                    console.log("Fichier supprimé :", pathFile);
                } catch (err) {
                    console.error("Erreur lors de la suppression du fichier :", err);
                }


                if (getUserToDelete && getHisFriends.length > 0) {
                    for (const friend of getHisFriends) {
                        await friend.destroy();
                    }
                    response.status(200).json("Votre utilisateur a bien été supprimé")

                } else {
                    response.status(200).json("Votre utilisateur a bien été supprimé")

                }
            }



        } catch (error) {

            console.error(error);
            response.status(500).json({ error: "Erreur serveur." });
        }


    })


    /**
     * Cette route permet d'envoyer une demande d'ami parmis les utilisateurs afficher dans la barre de recherche OK
     */
    app.post('/send-friend-requests', getClientTokenAndVerifAccess, async (request, response) => {
        // recupere un objet du front {userid(demandeur):1, friendid(receveur):2}
        // le front fetch lien,{methode:post, body: {objet: {userid(demandeur):1, friendid(receveur):2} }}

        try {
            const data = request.body;

            if (!data) {
                return response.status(400).json({ error: "Données manquantes." });
            } else {
                console.log("data body : ", data);


                const user1 = await User.findByPk(data.userId);//user1 ici c'est moi donc l'utilisateur qui envoie une demande 
                const user2 = await User.findByPk(data.friendId);//user2 ici c'est l'utilisater que je demande en ami 
                console.log(user1);
                console.log(user2);


                // verifie si la relation existe deja avec le status pending ou accept,si elle nexiste pas alors il poursuie et envoie une demande


                const addNewFriend = await user1.addFriend(user2);

                if (!addNewFriend) {
                    return response.status(400).json({ error: "Impossible d'ajouter l'ami." });
                } else {

                    console.log(`vous avez bien ajouter l'user : ${user2} en ami. `)
                    response.status(200).json({
                        message: "la demande d'ami a bien été envoyer",
                        body: addNewFriend
                    });

                }

            }

        } catch (error) {
            console.error(error); // pour le voir dans la console
            response.status(500).json({ error: "Erreur serveur lors de l'envoie de la demande d'ami." });

        }

    })

    /**
     * Récupérer les demandes d'amis reçues OK
     */
    app.get('/friend-requests/:userId', getClientTokenAndVerifAccess, async (request, response) => {
        try {
            const { userId } = request.params;//ici c'est mon userId 
            // console.log(userId)
            const requests = await Friends.findAll({ where: { friendId: userId, status: 'pending' } });// je verifie si mon userId est present dans la colonne friendId avec un status 'pending' ,ca signifie qu'un autre utiisateur m'a demandé en ami
            // console.log("ma requete ------------- : ",requests)
            if (!requests) {
                response.status(500).json("une demande d'ami recue.")

            } else {
                const dataUsers = [];
                for (const request of requests) {
                    const requestId = request.dataValues.UserId
                    // console.log("-----------------------------------------------------",request)

                    const findDataUsers = await User.findByPk(requestId);
                    // console.log(findDataUsers)
                    const profilPicture = await getProfilPictureFromDataB(requestId);

                    const user = {
                        id: findDataUsers.dataValues.id,
                        username: findDataUsers.dataValues.username,
                        imagePath: profilPicture,

                    }

                    dataUsers.push(user)
                    // console.log(dataUsers);


                }
                response.status(200).json(dataUsers);


            }
        } catch (error) {
            response.status(500).json({ error: "Erreur serveur." });
        }
    });


    /**
     * cette route permet a l'utilisateur deja connecte de recevoir d'accepter ou refuser OK
     */
    app.post('/confirm-friend-requests', getClientTokenAndVerifAccess, async (request, response) => {
        try {
            const { userId, friendId, reponse } = request.body;
            console.log({
                userId,
                friendId,
                reponse
            });

            if (!userId || !friendId || !["accept", "refuse"].includes(reponse)) {
                return response.status(400).json({ error: "Données manquantes ou invalides." });
            }

            const friendRequest = await Friends.findOne({
                where: { friendId: userId, UserId: friendId, status: 'pending' }
            });

            if (!friendRequest) {
                return response.status(404).json({ error: "Demande d'ami non trouvée." });
            }

            if (reponse == "accept") {
                friendRequest.status = "accepted";
                await friendRequest.save();

                // Crée ou met à jour la relation inverse
                let inverseRequest = await Friends.findOne({
                    where: { friendId: friendId, UserId: userId }
                });

                if (!inverseRequest) {
                    await Friends.create({
                        UserId: userId,
                        friendId: friendId,
                        status: "accepted"
                    });
                } else {
                    inverseRequest.status = "accepted";
                    await inverseRequest.save();
                }

                return response.status(200).json({ message: "vous avez bien accepté la demande d'ami " });
            } else if (reponse == "refuse") {
                await friendRequest.destroy(); // Supprime la relation
                return response.json({ message: "Demande d'ami refusée et supprimée." });
            }

        } catch (error) {
            console.error(error); // pour le voir dans la console
            response.status(500).json({ error: "Erreur serveur lors de l'envoie de la demande d'ami." });
        }
    });

    /**
     * Cette route permet de supprimer un ami , detruit la relation presente dans la table Friends dans les deux sens OK
     */
    app.delete('/delete-friend', getClientTokenAndVerifAccess, async (request, response) => {

        try {
            const { userId, friendId } = request.body;
            console.log({ userId, friendId });

            if (!userId || !friendId) {
                return res.status(400).json({ error: "Données manquantes ou invalides." });

            }

            const relation1 = await Friends.findOne({
                where: { UserId: userId, friendId: friendId }
            });

            const relation2 = await Friends.findOne({
                where: { UserId: friendId, friendId: userId }
            });

            await relation1.destroy();
            await relation2.destroy();

            return response.status(200).json({
                message: "vous avez bien supprimé l'ami."
            })


        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur." });
        }

    });

    /**
     * cette route permet de recuperer mes amis , donc dont le status est bien accepted  OK
     */
    app.get('/myfriend/:userId', getClientTokenAndVerifAccess, async (request, response) => {

        try {
            const { userId } = request.params;//ici c'est mon user
            // console.log(userId); //3

            const allFriends = await Friends.findAll({
                // where: { [Op.or]: [{ UserId: userId }, { friendId: userId }], status: 'accepted' }
                where: { UserId: userId, status: "accepted" },
            });

            if (allFriends.length === 0) {
                return response.status(400).json("vous n'avez aucun ami.")
            }

            if (allFriends) {
                console.log(allFriends);
            }
            // console.log(allFriends)
            const dataOfFriend = [];

            for (const userFriend of allFriends) {
                const userfriendid = userFriend.dataValues.friendId;
                const profilPicture = await getProfilPictureFromDataB(userfriendid);


                const findDataUsers = await User.findByPk(userfriendid);
                const user = {
                    id: findDataUsers.dataValues.id,
                    username: findDataUsers.dataValues.username,
                    imagePath: profilPicture,
                    // pp : findDataUsers.dataValues.pp
                };
                // console.log(user);
                dataOfFriend.push(user);

            }
            // console.log(dataOfFriend)
            response.status(200).json(dataOfFriend);



            // response.status(200).json(friends)

        } catch (error) {

            console.error(error); // pour le voir dans la console
            response.status(500).json({ error: "Erreur serveur." });

        }

        // select tout les relation ou je suis present dans les colonnes UserId et FriendId et dont le status est accepted puis le renvoie a la l'utilisateur;



    })

    app.listen(port, () => {

        console.log(`Server listen on port ${port}`)
    })

}
























