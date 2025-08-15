import { userInfo } from "os";
import { DataTypes, ENUM, Model, Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { group } from "console";

dotenv.config();

if (!process.env.DATABASE_URL) {
    console.error("[db] DATABASE_URL manquant dans l'environnement");
}

// Active SSL seulement si DATABASE_SSL=true (utile pour Supabase / hébergeur managé)
const useSSL = (process.env.DATABASE_SSL || '').toLowerCase() === 'true';

const sequelizeConfig = {
    dialect: 'postgres'
};

if (useSSL) {
    sequelizeConfig.dialectOptions = {
        ssl: { require: true, rejectUnauthorized: false }
    };
}

export const sequelize = new Sequelize(process.env.DATABASE_URL || '', sequelizeConfig);

/**
 * permet de se connecter a la bdd supabase ici
 */
sequelize.authenticate()
    .then(() => console.log(" ### Connexion à la base de donnée ###"))
    .catch(error => console.log(error));

