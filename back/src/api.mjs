// dependances externes du projet 
import { json, Op, Sequelize } from "sequelize";
import express, { request, response } from "express";
import cors from "cors";
// import {AdminUser} from "./database.mjs"
import bcrypt from "bcrypt";
import parseFormData from '@trojs/formdata-parser';
import fileUpload from "express-fileupload";
import { get } from "http";
import jwt from "jsonwebtoken"
import fs from "fs/promises";
import { error, group } from "console";
import { getgroups } from "process";

// dépendances internes du projet
import { User } from "./database.mjs";
import { getAndSaveProfilPicture } from "./models/getAndSaveProfilPicture.mjs";
import { profilPicture } from "./database.mjs";
import { getProfilPictureFromDataB } from "./models/getAndSaveProfilPicture.mjs"
import { getClientTokenAndVerifAccess } from "./models/getClientTokenAndVerifAccess.mjs";
import { groupName } from "./database.mjs";
import { groupMembers } from "./database.mjs";
import { conversation } from "./database.mjs";
import { sequelize } from "./database.mjs";
import { Friends } from "./database.mjs";
import { Message } from "./database.mjs";
import { GroupMessage } from "./database.mjs";
import { privateMessage } from "./database.mjs";
import { stringify } from "querystring";
import { Json } from "sequelize/lib/utils";



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

                    const insertNewUser = await User.findOrCreate({ //create sinon
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

    //route create admin
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
     * 
    */
    app.delete("/admin/delete/:userId", async (request, response) => {

        try {

            const userId = request.params
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
     * cette route doit permettre a un utilisateur de supprimer son compte  OK
     */
    app.delete('/delete/user/:userId', getClientTokenAndVerifAccess, async (request, response) => {

        try {

            const { userId } = request.params;

            const getUserToDelete = await User.findByPk(userId);
            // console.log(getUserToDelete);c

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


    /**
     * cette route permet de rejoindre ou creer un chat avec un ami
     */
    app.post('/private-chat', getClientTokenAndVerifAccess, async (request, response) => {
        try {
            // Récupère les id des deux utilisateurs qui vont chater ensemble
            const { myUserId, friendUserId } = request.body;
            if (!myUserId || !friendUserId) {
                return response.status(400).json({ error: "Données manquantes." });
            }

            // Génère le nom unique de la room
            const [id1, id2] = [myUserId, friendUserId].sort((a, b) => a - b);
            const chatName = `${id1}/${id2}`;

            // Vérifie ou crée la conversation
            let conv = await conversation.findOne({ where: { chat_name: chatName } });

            if (!conv) {
                conv = await conversation.create({
                    chat_name: chatName,
                    UserId: id1,
                    friendId: id2
                });
            }

            // Renvoie au client le nom de la room et l'id de la conversation
            response.status(200).json({
                chat_name: chatName,
                conversationId: conv.id
            });

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }
    });


    /**
     * cette route permet de rejoindre ou creer un groupe de chat avec plusieurs amis
     */
    app.post('/group-chat', getClientTokenAndVerifAccess, async (request, response) => {

        try {

            const data = request.body;
            console.log(data);
            if (!data || !data.usersArray || !data.newGroupName) {
                return response.status(400).json({ error: "Données manquantes." });
            } else {

                // console.log(data.usersArray) // l'Array de tout les users invite au groupe ou y participant
                // console.log(data.newGroupName)// le nom du groupe 


                let usersArray = data.usersArray;
                if (typeof usersArray === "string") {
                    try {
                        usersArray = JSON.parse(usersArray);
                    } catch (error) {
                        return response.status(400).json({ error: "usersArray mal formé" });
                    }
                }
                if (!Array.isArray(usersArray) || usersArray.length === 0) {
                    return response.status(400).json({ error: "usersArray doit être un tableau non vide" });
                }



                // enregistre dans la table groupName le nom du groupe qui vient d'etre créer 
                const newGroup = await groupName.create({
                    group_name: data.newGroupName

                })

                // Si erreur dans l'ajout
                if (!newGroup) {
                    return response.status(500).json({
                        message: "impossible d'ajouter le groupe name en bdd",
                        body: data.newGroupName
                    })
                } else { //sinon

                    console.log("le groupe a bien été ajouter", data.newGroupName);

                    // une fois le nom de groupe enregistrer on récupère son id 
                    const getGroup = await groupName.findOne({ where: { group_name: data.newGroupName } })
                    if (!getGroup) {
                        console.error("Impossible de récupérer l'id du groupe");
                        throw new Error("Impossible de récupérer l'id du groupe");
                    }

                    console.log("ID du groupe :", getGroup.id);


                    // insere le groupeId a chaque fois suivi des UserId qui sont dedans 
                    for (const oneUser of usersArray) {
                        const addUserToGroup = await groupMembers.findOrCreate({
                            where: {

                                groupNameId: getGroup.id,
                                UserId: oneUser

                            }
                        });
                        if (!addUserToGroup) {
                            throw new Error(`impossible d'ajouter a les UserId au groupe : ${getGroup.id}`)
                            console.error(`impossible d'ajouter a les UserId au groupe : ${getGroup.id}`);
                        }
                    }

                    // Récupère les membres du groupe pour la réponse
                    const members = await groupMembers.findAll({
                        where: { groupNameId: getGroup.id },
                        attributes: ['UserId']
                    });

                    response.status(201).json({
                        groupId: getGroup.id,
                        groupName: getGroup.group_name,
                        members: members.map(m => m.UserId)
                    });
                }

            }

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }

    })


    /**
     * cette route permet d'ajouter un membre dans un groupe
     */
    app.post('/add-group-member', getClientTokenAndVerifAccess, async (request, response) => {

        try {

            const data = request.body;
            console.log(data.newMemberId)
            console.log(data.groupId)

            if (!data) {
                return response.status(400).json({ error: "Données manquantes." });
            } else {

                const findGroup = await groupName.findOne({ where: { id: data.groupId } })

                if (!findGroup) {
                    return response.status(400).json({ error: "groupe inexistant." });

                }

                if (findGroup) {

                    const verifMemberExist = await groupMembers.findOne({
                        where: { groupNameId: data.groupId, UserId: data.newMemberId }
                    })

                    if (verifMemberExist) {
                        return response.status(400).json({ error: "membre deja dans le groupe." });
                    } {

                        const InsertNewMember = await groupMembers.create({
                            groupNameId: data.groupId, UserId: data.newMemberId
                        })

                        if (InsertNewMember) {

                            return response.status(200).json({
                                message: `le nouveau membre du groupe a bien été ajouter : ${data.newMemberId}`,
                                body: {
                                    groupe: findGroup.group_name,
                                    id: data.newMemberId,
                                }
                            })

                        }

                    }

                }
            }

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }
    })


    /**
     * cette route permet de quitter un groupe 
     */
    app.delete('/quit-group-member', getClientTokenAndVerifAccess, async (request, response) => {

        try {

            const data = request.body;
            // console.log(data);
            console.log(data.MemberId);
            console.log(data.groupId);

            if (!data) {
                return response.status(400).json({ error: "Données manquantes." });
            } else {


                const findGroup = await groupName.findOne({ where: { id: data.groupId } })

                if (!findGroup) {
                    return response.status(400).json({ error: "groupe inexistant." });

                }

                if (findGroup) {

                    const verifMemberExist = await groupMembers.findOne({
                        where: { groupNameId: data.groupId, UserId: data.MemberId }
                    })

                    if (!verifMemberExist) {
                        return response.status(400).json({ error: "membre du groupe introuvable." });
                    }

                    if (verifMemberExist) {
                        const deleteMember = await groupMembers.destroy({
                            where: {
                                groupNameId: data.groupId,
                                UserId: data.MemberId
                            }
                        });

                        if (deleteMember) {
                            return response.status(200).json({
                                message: "Le membre a bien quitté le groupe.",
                                memberId: data.MemberId,
                                groupId: data.groupId
                            });
                        } else {
                            return response.status(500).json({ error: "Erreur lors de la suppression du membre du groupe." });
                        }


                    }

                }

            }

        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }
    })


    // historique et message de groupe


    // 4 routes
    // envoyer un message et save en bdd
    // modifier un message et save en bdd
    // supprimer un message et save en bdd
    // recuperer les messages quand on arrive sur un chat



    /**
     * cette route enregistre dans la table Messages le message envoyer par un utilisateur dans un groupe, puis apres cela il ajoute dans la table groupMessages 
     * l'id de celui qui l'a envoyer, dans quel groupe et l'id du message enregistrer préalablement afin de pouvoir toujours le retrouver
     */
    app.post('/send-group-message', getClientTokenAndVerifAccess, async (request, response) => {

        try {

            // recupere le body de la requete 
            const { messageContent, UserId, groupId } = request.body;
            console.log({
                messageContent,
                UserId,
                groupId
            });


            if (!request.body || !messageContent || !UserId || !groupId) {
                return response.status(400).json("données manquantes.")
            }

            if (messageContent || UserId || groupId) {

                // ajoute le message envoyer par un User dans la table Messages 
                const insertNewMessage = await Message.create({
                    content: messageContent,
                })

                if (!insertNewMessage) {
                    console.error("impossible d'ajouter le message.")
                    throw new error("impossible d'ajouter le message")
                }

                if (insertNewMessage) {
                    let MessageID = insertNewMessage.dataValues.id
                    MessageID = JSON.stringify(MessageID)
                    console.log(MessageID)


                    const newGroupMessage = await GroupMessage.create({
                        UserId: UserId,      // id de l'utilisateur
                        GroupNameId: groupId,    // id du groupe
                        MessageID: MessageID // id du message
                    })


                    if (!newGroupMessage) {
                        throw new error("erreur : message non inserer dans la bdd")
                    }

                    if (newGroupMessage) {
                        return response.status(200).json({
                            message: "Message enregistré, Historique à jour",
                            body : {
                                UserId,
                                groupId,
                                MessageID,
                                messageContent
                            }
                        })
                    }
                }

            }


        } catch (error) {
            console.error(error);
            response.status(500).json({ error: "Erreur serveur" });
        }

    })









    // historique et message privée


    // 4 routes 
    // envoyer un message a un ami et save en bdd
    // modifer un message et save en bdd
    // supprimer un message et save en bdd
    // recuperer tout les messages que l'on a echanger avec un ami














    app.listen(port, () => {

        console.log(`Server listen on port ${port}`)
    })

}





















// app.delete('/quit-group-member', getClientTokenAndVerifAccess, async (request, response) => {
//     try {
//         const data = request.body;
//         console.log(data.MemberId);
//         console.log(data.groupId);

//         if (!data) {
//             return response.status(400).json({ error: "Données manquantes." });
//         }

//         const findGroup = await groupName.findOne({ where: { id: data.groupId } });
//         if (!findGroup) {
//             return response.status(400).json({ error: "groupe inexistant." });
//         }

//         const verifMemberExist = await groupMembers.findOne({
//             where: { groupNameId: data.groupId, UserId: data.MemberId }
//         });

//         if (!verifMemberExist) {
//             return response.status(400).json({ error: "membre du groupe introuvable." });
//         }

//         const deleteMember = await groupMembers.destroy({
//             where: {
//                 groupNameId: data.groupId,
//                 UserId: data.MemberId
//             }
//         });

//         if (deleteMember) {
//             // Vérifie s'il reste des membres dans le groupe
//             const remainingMembers = await groupMembers.count({
//                 where: { groupNameId: data.groupId }
//             });

//             if (remainingMembers === 0) {
//                 await groupName.destroy({ where: { id: data.groupId } });
//                 return response.status(200).json({
//                     message: "Le membre a bien quitté le groupe. Le groupe a été supprimé car il n'avait plus de membres.",
//                     memberId: data.MemberId,
//                     groupId: data.groupId
//                 });
//             }

//             return response.status(200).json({
//                 message: "Le membre a bien quitté le groupe.",
//                 memberId: data.MemberId,
//                 groupId: data.groupId
//             });
//         } else {
//             return response.status(500).json({ error: "Erreur lors de la suppression du membre du groupe." });
//         }
//     } catch (error) {
//         console.error(error);
//         response.status(500).json({ error: "Erreur serveur." });
//     }
// });