const nodemailer = require("nodemailer")
const config = require("../../config");


let configOptions = {
  host:config.mail.host,
  port: config.mail.port,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
};

const transporter = nodemailer.createTransport(configOptions);

async function sendMail(to,  code) {
  const info = await transporter.sendMail({
    from: config.mail.user, // sender address
    to, // list of receivers
    subject: "Hello ✔", // Subject line
    text: `Your confirmation code is:  ${code}`, // plain text body
    html: `<b> Your confirmation code is: ${code}</b>`, // html body
  });
 

  console.log("Message sent: %s,", info.messageId)
}

module.exports = sendMail;

