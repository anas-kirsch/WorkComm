import { userInfo } from "os";
import { DataTypes, ENUM, Model, Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { group } from "console";

dotenv.config();

/**
 * defini les données d'authentification pour se connecter à la bdd supabase
 */
// export const sequelize = new Sequelize("postgres", "postgres", process.env.DB_PASSWORD ?? "root", {
//     "host": process.env.DB_HOST ?? "localhost",
//     "port": process.env.DB_PORT ?? 5432,
//     "dialect": "postgres"
// })



/**
 * 
 */
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Nécessaire pour Supabase
        }
    }
});


/**
 * permet de se connecter a la bdd supabase ici
 */
sequelize.authenticate()
    .then(() => console.log(" ### Connexion à la base de donnée ###"))
    .catch(error => console.log(error));

