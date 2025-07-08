import express from "express"


export class adminController {
        
    /**
     * 
     * A MODIFIER : CETTE METHODE EST A REVOIR ET A SECURISER AVEC UN JWT ADMIN 
     * 
     * 
     * 
     * cette methode static permet à un admin de donner le role d'admin a un utilisateur existant ou à creer un nouvel admin directement 
     * @param {*} request 
     * @param {*} response 
     * @returns 
     */
    static async adminRegister(request,response){

           try {
            console.log("route : admin-register")

            const myNewAdmin = request.body;
            console.log("1", myNewAdmin);

            if (!myNewAdmin) {
                return response.status(400).json({ error: "Données manquantes." });
            }

            if (myNewAdmin) {
                if (myNewAdmin.password != myNewAdmin.confirmPassword) {
                    return response.status(400).json({ error: "Les mots de passe ne correspondent pas." });

                } else {

                    const ValidAdmin = {
                        username: myNewAdmin.username,
                        mail: myNewAdmin.mail,
                        password: myNewAdmin.password
                    }
                    console.log("2", ValidAdmin)

                    const insertNewAdmin = await AdminUser.create({
                        username: ValidAdmin.username,
                        mail: ValidAdmin.mail,
                        password: ValidAdmin.password,
                    });
                    console.log('3:', insertNewAdmin);

                    if (insertNewAdmin) {

                        response.status(200).json({
                            message: 'votre admin a bien été créer',
                            user: {
                                username: insertNewAdmin.username,
                                mail: insertNewAdmin.mail
                            }

                        });

                    };

                };
            };

        } catch (error) {
            console.error(error); // pour le voir dans la console
            response.status(500).json({ error: "Erreur serveur lors de l'inscription." });
        }






    }













}