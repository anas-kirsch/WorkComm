import { userInfo } from "os";
import { DataTypes, ENUM, Model, Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { group } from "console";

//connection à la bdd 
import { sequelize } from "../configs/dbConnect.mjs";


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
        allowNull: true,
        defaultValue: "..."
    },
    resetToken: {
        type : DataTypes.STRING,
        unique : true,
        allowNull : true
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
 * cette table permet de referencer les diffentes conversations ouvertes entres des amis ainsi que le nom de leur conversation
 */
export const conversation = sequelize.define("conversation", {
    chat_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    indexes: [
        {
            unique: true,
            fields: ['UserId', 'friendId']
        }
    ],
    hooks: {
        beforeValidate: (conv) => {
            if (conv.UserId && conv.friendId) {
                const [id1, id2] = [conv.UserId, conv.friendId].sort((a, b) => a - b);
                conv.chat_name = `${id1}/${id2}`;
                conv.UserId = id1;
                conv.friendId = id2;
            }
        }
    }
});


/**
 * cette table permet de referencer les noms des conversations de groupes qui ont été crées
 */
export const groupName = sequelize.define("groupName", {

    group_name: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true
    }

})



/**
 * cette table est une jointure entre les tables groupName et User, référencant les participants de chaque groupe
 */
export const groupMembers = sequelize.define("groupMembers", {

}, {
    timestamps: false
});


/**
 * cette table permet d'enregistrer tout les messages de l'application que ce soit des conversations privées ou de groupes
 */
export const Message = sequelize.define('Message',{

    content: {
        type : DataTypes.STRING,
        allowNull :false,
    }
})

/**
 * cette table referencie quel User de quel groupe a envoyer quel message 
 */
export const GroupMessage = sequelize.define("groupMessage",{
    
})

/**
 * cette table referencie les conversations (donc messages) privées entre deux users à chaque fois 
 */
export const privateMessage = sequelize.define("privateMessage",{


})


/**
 * relation creant la table de jointure qui enregiste l'historique des messages envoyés dans un groupe
 */
GroupMessage.belongsTo(User,{ foreignKey : "UserId"});
GroupMessage.belongsTo(groupName,{foreignKey : "GroupNameId"});
GroupMessage.belongsTo(Message,{foreignKey : "MessageID"});

/**
 * relation creant la table de jointure qui enregistre l'historique des messages envoyés dans un chat privé 
 */
privateMessage.belongsTo(User,{foreignKey : "SenderId"});
privateMessage.belongsTo(User,{foreignKey : "receiverId"});
privateMessage.belongsTo(conversation,{foreignKey : "ConversationId"});
privateMessage.belongsTo(Message,{foreignKey : "MessageId"});



/**
 * ces relations crées une jointure entre la table groupName et User par l'intermédiraire de la table groupMembers
 */


/**
 * relation pour faire la table qui save les membres de chaque groupe
 */
User.belongsToMany(groupName, { through: groupMembers, foreignKey: "UserId" });
groupName.belongsToMany(User, { through: groupMembers, foreignKey: "groupNameId" });




/**
 * Un utilisateur peut avoir plusieurs conversations où il est l'utilisateur principal (UserId).
 */
User.hasMany(conversation, { foreignKey: 'UserId' });

/**
 * Chaque conversation appartient à un utilisateur principal (UserId).
 */
conversation.belongsTo(User, { foreignKey: 'UserId' });

/**
 * Un utilisateur peut aussi avoir plusieurs conversations où il est l'ami (friendId).
 */
User.hasMany(conversation, { foreignKey: 'friendId', as: 'friendConversations' });

/**
 * Chaque conversation appartient aussi à un utilisateur ami (friendId), référencé comme 'friend'.
 */
conversation.belongsTo(User, { foreignKey: 'friendId', as: 'friend' });




/**
 * creer la relation entre les tables User et Friends 
 */
User.belongsToMany(User, { as: 'friend', through: Friends });

/**
 * creer la relation entre les tables User et profilPicture
 */
User.hasOne(profilPicture);
profilPicture.belongsTo(User);





groupMembers.belongsTo(User, { foreignKey: 'UserId' });
User.hasMany(groupMembers, { foreignKey: 'UserId' });

