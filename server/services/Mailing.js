import nodemailer from 'nodemailer';

/**
 * The mailing services provides an interface to send emails to users
 * of courier service.
 *
 * @class
 */

export default class Mailing {
  /**
   * Instantiates a new mailing service wrapper.
   *
   * @param {string} user - The email address to setup the smtp
   * @param {string} pass - The password of the #user
   */
  constructor(user, pass) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 456,
      secure: true,
      auth: {
        user,
        pass,
      },
    });
    this.email = user;
  }

  /**
   * Sends a mail to a user using the transporter created.
   *
   * @param {object} options - The mailing options.
   * @param {string} options.from - The email address to send from
   * @param {string} options.to - The email address to send to
   * @param {string} options.subject - The subject of the message
   * @param {string} options.html - The html content of the message
   */
  sendMail(options) {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        ...options,
        from: this.email,
      };
      this.transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    });
  }
}
