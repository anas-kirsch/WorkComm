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
    })

    const send = await transporter.sendMail({
        from: '"WorkComm" <workcomm831@gmail.com>',
        to: mail,
        subject: "Bienvenue sur WorkComm ! 🎉",
        text: `Bonjour ${username},

Votre compte a bien été créé.

Identifiant :
${username}
Email :
${mail}

Merci de votre confiance et bienvenue dans la communauté WorkComm !

L'équipe WorkComm`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #222;">
                <div style="background: #4F8DFD; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h3 style="color: #fff; margin: 0; font-size: 1.3em; font-weight: 600;">
                        Bienvenue sur WorkComm ! 🎉
                    </h3>
                </div>
                <div style="background: #fff; padding: 24px; border-radius: 0 0 8px 8px;">
                    <p>Bonjour <b>${username}</b>,</p>
                    <p>Votre compte a bien été créé avec succès.</p>
                    <table style="margin: 16px 0; font-size: 15px;">
                        <tr>
                            <td style="padding: 4px 8px; vertical-align: top;"><b>Identifiant :</b></td>
                        </tr>
                        <tr>
                            <td style="padding: 0 8px 8px 8px; color: #4F8DFD;">${username}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 8px; vertical-align: top;"><b>Email :</b></td>
                        </tr>
                        <tr>
                            <td style="padding: 0 8px 8px 8px; color: #4F8DFD;">${mail}</td>
                        </tr>
                    </table>
                    <p>Merci de votre confiance et bienvenue dans la communauté WorkComm !</p>
                    <hr style="margin: 24px 0;">
                    <p style="font-size: 13px; color: #888;">Ceci est un message automatique, merci de ne pas répondre directement à cet email.</p>
                </div>
            </div>
        `
    })

    // const send = await transporter.sendMail({
    //     from: '"WorkComm" <workcomm831@gmail.com>',
    //     to: mail,
    //     subject: "Hello ✔",
    //     text: `Bonjour ${username},\n\nVotre compte a bien été créé.\n\nIdentifiant: ${username}\n\nMerci de votre confiance.`,
    //     html: `<b>Bonjour ${username},</b><br><br>Votre compte a bien été créé.<br><br><b>Identifiant:</b> ${username}<br><br>Merci de votre confiance.`
    // })


    return send;


}