


import crypto from "crypto";

/**
 * Génère un token et un lien de réinitialisation de mot de passe
 * @param {string} baseUrl - L'URL de base du frontend (ex: https://workcomm.com/reset-password)
 * @returns {{token: string, link: string}}
 */
export function generateResetLink(baseUrl) {
    const token = crypto.randomBytes(32).toString("hex");
    const link = `${baseUrl}?token=${token}`;
    return { token, link };
}