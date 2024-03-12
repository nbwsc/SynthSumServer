const nodemailer = require('nodemailer');
const auth = {
    user: 'xxxxcapital@xxxxcapital.cn',
    pass: 'GvNrPAcgwo9824Qk',
};

const transporter = nodemailer.createTransport({
    host: 'smtp.exmail.qq.com',
    port: 465,
    secure: true,
    auth,
});

module.exports = {
    transporter,
    send: async (to, subject, html, attachments = []) => {
        const mailOptions = {
            from: auth.user,
            to,
            subject,
            html,
        };
        if (attachments.length) {
            mailOptions.attachments = attachments;
        }
        const r = await transporter.sendMail(mailOptions);
        return r;
    },
};
