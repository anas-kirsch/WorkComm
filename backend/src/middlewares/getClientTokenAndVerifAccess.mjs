import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET ?? "secret-key";


/**
 * cette fonction verifie le token client afin d'accorder ou non un acces selon le role
 * @param {*} request 
 * @param {*} response 
 * @param {*} next 
 * @returns 
 */
export async function getClientTokenAndVerifAccess(request, response, next) {

    try {
        //Coté client le token est envoyé dans le header authorization
        const authHeader = request.headers.authorization;

        console.log("authHeader", authHeader)
        // Je récupère uniquement le token du header pas le mot Bearer
        const token = authHeader.split(" ")[1];
        console.log(token)
        const verifyToken = await jwt.verify(token, secret);

        if (verifyToken) {

            console.log(verifyToken);
            console.log("token valid");

            request.user = verifyToken; // <-- Ajoute le token décodé à la requête

            switch (verifyToken.role) {
                case "admin":
                    next();
                    break;
                case "user":
                    next();
                    break;

                default:
                    response.status(401).json("Unauthorized");
                    break;
            }
        }
        // else {
        //     console.log("unauthorized, wrong token");
        // }


    } catch (error) {
        console.error("JWT error:", error); // Ajoute ceci
        response.status(401).json({
            message: "Unauthorized access",
            error: error.message
        });
        return;
    }

    // next(); 



}


export default getClientTokenAndVerifAccess;