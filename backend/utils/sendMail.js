const nodemailer = require("nodemailer");

const sendMail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || process.env.SMPT_HOST,
        port: process.env.SMTP_PORT || process.env.SMPT_PORT,
        service: process.env.SMTP_SERVICE || process.env.SMPT_SERVICE,
        auth:{
            user: process.env.SMTP_MAIL || process.env.SMPT_MAIL,
            pass: process.env.SMTP_PASSWORD || process.env.SMPT_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL || process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;