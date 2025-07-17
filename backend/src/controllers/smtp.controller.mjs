import nodemailer from 'nodemailer';



/**
 * cette fonction prend les données d'un utilisateur qui vient de réussir la création de son compte et lui envoi ses identifiants
 * @param {string} username - Le nom d'utilisateur
 * @param {string} mail - L'adresse email de l'utilisateur
 */
export async function emailSender(username, mail) {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "workcomm831@gmail.com",
            pass: "khbb kbfs qwou srjk "
        }
    });

    const send = await transporter.sendMail({
        from: '"WorkComm" <workcomm831@gmail.com>',
        to: mail,
        subject: "Bienvenue dans la communauté WorkComm ! 🚀",
        text: `Salut ${username},

Ton compte WorkComm est prêt !

Identifiant :
${username}
Email :
${mail}

Nous sommes ravis de t’accueillir. Explore, connecte-toi et profite de toutes les fonctionnalités WorkComm.

À très vite,
L’équipe WorkComm`,
        html: `
            <div style="font-family: 'Inter', 'Roboto', Arial, sans-serif; background: linear-gradient(120deg, #18181b 0%, #23232a 60%, #0f0f0f 100%); min-height: 100%; padding: 0; margin: 0;">
                <div style="max-width: 520px; margin: 32px auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.45); border: 1px solid rgba(139, 92, 246, 0.3);">
                    <div style="background: linear-gradient(120deg, #8B5CF6 0%, #a855f7 100%); padding: 24px 32px; display: flex; align-items: center;">
                        <h1 style="
                            font-family: 'Inter', 'Roboto', Arial, sans-serif;
                            font-size: 2rem;
                            font-weight: 700;
                            margin: 0;
                            color: #fff;
                            letter-spacing: 2px;
                            background: linear-gradient(135deg, #8B5CF6 0%, #a855f7 50%, #c084fc 100%);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                            text-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
                        ">
                            Bienvenue sur WorkComm&nbsp;! 🚀
                        </h1>
                    </div>
                    <div style="background: #23232a; padding: 32px; color: #cfcfff;">
                        <p style="font-size: 1.1rem; margin-bottom: 18px;">Salut <b style="color:#8B5CF6;">${username}</b>,</p>
                        <p style="margin-bottom: 18px;">Ton compte WorkComm est maintenant actif. Voici tes informations :</p>
                        <table style="width: 100%; margin: 18px 0 24px 0; font-size: 1rem; border-collapse: separate; border-spacing: 0;">
                            <tr>
                                <td style="padding: 8px 0; color: #a855f7; font-weight: 600;">Identifiant :</td>
                                <td style="padding: 8px 0; color: #c084fc;">${username}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #a855f7; font-weight: 600;">Email :</td>
                                <td style="padding: 8px 0; color: #c084fc;">${mail}</td>
                            </tr>
                        </table>
                        <p style="margin-bottom: 18px;">Nous sommes ravis de t’accueillir. Explore, connecte-toi et profite de toutes les fonctionnalités WorkComm.</p>
                        <div style="margin: 32px 0 0 0; border-top: 1px solid rgba(139, 92, 246, 0.2); padding-top: 18px;">
                            <p style="font-size: 0.95rem; color: #888;">Ceci est un message automatique, merci de ne pas répondre directement à cet email.</p>
                            <p style="font-size: 1rem; color: #8B5CF6; margin-top: 8px;">À très vite,<br>L’équipe WorkComm</p>
                        </div>
                    </div>
                </div>
            </div>
        `
    });

    return send;
}


/**
 * cette fonction envoie un mail de reinitisalisation du mot de passe d'un utilisateur 
 * @param {string} username - Le nom d'utilisateur
 * @param {string} mail - L'adresse email de l'utilisateur
 * @param {string} resetLink - Le lien de réinitialisation du mot de passe
 */
export async function emailResetPassword(username, mail, resetLink) {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "workcomm831@gmail.com",
            pass: "khbb kbfs qwou srjk "
        }
    });

    const send = await transporter.sendMail({
        from: '"WorkComm" <workcomm831@gmail.com>',
        to: mail,
        subject: "Réinitialisation de votre mot de passe WorkComm",
        text: `Bonjour ${username},

Vous avez demandé la réinitialisation de votre mot de passe.

Veuillez cliquer sur le lien suivant pour définir un nouveau mot de passe :
${resetLink}

Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.

L'équipe WorkComm`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #222;">
                <div style="background: #4F8DFD; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h3 style="color: #fff; margin: 0; font-size: 1.3em; font-weight: 600;">
                        Réinitialisation de votre mot de passe
                    </h3>
                </div>
                <div style="background: #fff; padding: 24px; border-radius: 0 0 8px 8px;">
                    <p>Bonjour <b>${username}</b>,</p>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                    <p>
                        <a href="${resetLink}" style="background: #4F8DFD; color: #fff; padding: 10px 18px; border-radius: 5px; text-decoration: none;">
                            Réinitialiser mon mot de passe
                        </a>
                    </p>
                    <p style="font-size: 13px; color: #888;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
                </div>
            </div>
        `
    });

    return send;
}