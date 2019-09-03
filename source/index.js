const Mailer = require('./service/mail');
const Rabbit = require('./service/rabbit');
const config = require('./config');

const rabbit = new Rabbit(config.get('rabbit'));
const mailer = new Mailer(config.get('mail'));

mailer.on('message', (message) => {
  rabbit.send(message);
});

mailer.once('end', () => {
  setTimeout(() => {
    mailer.connect();
  }, 60000);
});

mailer.once('error', (err) => {
  if (!err) {
    return mailer.connect();
  }
  console.log(err, JSON.stringify(err));
  console.error(err);
  process.exit(1);
});

mailer.connect();
