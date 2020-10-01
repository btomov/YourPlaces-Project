const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");
const options = {
  auth: {
    api_user: process.env.JWT_KEY,
    api_key: process.env.SENDGRID_PASSWORD,
  },
};
const client = nodemailer.createTransport(sgTransport(options));

// Send e-mail object to user
client.sendMail(emailActivate, function (err, info) {
  if (err) {
    console.log(err);
  } else {
    console.log("Activiation Message Confirmation -  : " + info.response);
  }
});
res.json({
  succeed: true,
  message: "User has been successfully activated",
});

module.exports = sendMail;
