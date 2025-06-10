import { userInfo } from "os";
import { DataTypes, ENUM, Model, Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

/**
 * defini les données d'authentification pour se connecter à la bdd supabase
 */
export const sequelize = new Sequelize("postgres", "postgres", process.env.DB_PASSWORD ?? "root", {
    "host": process.env.DB_HOST ?? "localhost",
    "port": process.env.PORT ?? "3000",
    "dialect": "postgres"
})

/**
 * permet de se connecter a la bdd supabase ici
 */
sequelize.authenticate()
    .then(() => console.log(" ### Connexion à la base de donnée ###"))
    .catch(error => console.log(error));


// define les tables

/**
 * ici une table utilisateur est creer 
 */
export const User = sequelize.define("User", {
    username: {
        type: DataTypes.STRING,
        unique: true
    },
    mail: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    language: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "french",
    },
    bio: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "..."
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user",

    },
    password: {
        type: DataTypes.STRING,
        validate: {
            is: {
                args: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                msg: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre."
            }
        }
    }
}, {
    hooks: {
        beforeCreate: async (user, options) => {
            if (user.password) {
                const hash = await bcrypt.hash(user.password, 10);
                user.password = hash;
            }
        }
    }

})


/**
 * ici une table de jointure es creer afin de permettre aux utilisateurs d'ajouter des amis
 */
export const Friends = sequelize.define("Friends", {
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'

    }
},
    {
        indexes: [
            {
                unique: true,
                fields: ['UserId', 'friendId']
            }
        ]
    }
);

/**
 * cette table permet de stocker la route de chaque photo de profil appartenant aux utilisateurs 
 */
export const profilPicture = sequelize.define("profilPicture", {
    imagePath: {
        type: DataTypes.STRING,
        allowNull: true,
        // defaultValue: "../public/images/default.jpg"
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['UserId']
        }
    ]
});



/**
 * creer la relation entre les tables User et Friends 
 */
User.belongsToMany(User, { as: 'friend', through: Friends });

/**
 * creer la relation entre les tables User et profilPicture
 */
User.hasOne(profilPicture);
// profilPicture.hasOne(User);
profilPicture.belongsTo(User);




