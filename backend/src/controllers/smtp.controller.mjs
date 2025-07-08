import nodemailer from 'nodemailer';



/**
 * cette fonction prend les données d'un utilisateur qui vient de réussir la création de son compte et lui envoi ses identifiants
 * @param {string} username - Le nom d'utilisateur
 * @param {string} mail - L'adresse email de l'utilisateur
 */
export async function emailSender(username,mail) {

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
        subject: "Hello ✔",
        text: `Bonjour ${username},\n\nVotre compte a bien été créé.\n\nIdentifiant: ${username}\n\nMerci de votre confiance.`,
        html: `<b>Bonjour ${username},</b><br><br>Votre compte a bien été créé.<br><br><b>Identifiant:</b> ${username}<br><br>Merci de votre confiance.`
    })


    return send; 


}