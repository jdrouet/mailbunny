const amqp = require('amqplib');
const debug = require('debug')('mailbunny:service:rabbit');

class Rabbit {
  constructor(config) {
    this._config = config;
    this._connection = null;
  }

  getConnection() {
    debug('get connection');
    if (!this._connection) {
      this._connection = amqp.connect(this._config.url);
    }
    return this._connection;
  }

  async buildChannel(channel) {
    debug('build channel');
    await channel.assertExchange(
      this._config.exchange.name,
      this._config.exchange.type,
      this._config.exchange.options,
    );
    return channel;
  }

  getChannel() {
    debug('get channel');
    if (!this._channel) {
      this._channel = this.getConnection()
        .then((con) => con.createChannel())
        .then((ch) => this.buildChannel(ch));
    }
    return this._channel;
  }

  async send(body) {
    debug('send');
    const buffer = Buffer.from(JSON.stringify(body));
    return this.getChannel()
      .then((ch) => ch.publish(this._config.exchange.name, '', buffer));
  }

  close() {
    return this.getChannel()
      .then((ch) => ch.close())
      .then(() => this.getConnection())
      .then((con) => con.close());
  }
}

module.exports = Rabbit;
