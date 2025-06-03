import { Op, Sequelize } from "sequelize";
import { User } from "../database.mjs";
import { Friends } from "../database.mjs";
import cors from "cors";

/**
 * @param {{ userId: number, friendId: number }} params
 */
export function getStateOfFriendship({ userId, friendId }) {
   

    // cette fonction verifie la relation possiblement entre deux id , si il sont amis , une demande est en cour ou alors aucune relation entre les deux 





}