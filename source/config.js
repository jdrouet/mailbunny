module.exports = require('nconf')
  .env('_')
  .file('env.json')
  .defaults({
    mail: {
      host: 'smtp.example.com',
      port: 587,
      // upgrade later with STARTTLS
      tls: true,
      user: 'username',
      password: 'password',
    },
    rabbit: {
      url: 'rabbit',
      exchange: {
        name: 'email-exchange',
        type: 'fanout',
        options: null,
      },
    },
  });
