const amqp = require('amqplib');
const config = require('../source/config').get('rabbit');
const Rabbit = require('../source/service/rabbit');

const EXCHANGE_NAME = 'testing-exchange';
const QUEUE_NAME = 'testing-queue';

describe('service/rabbit', function() {
  before(async function() {
    this.connection = await amqp.connect(config.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(
      EXCHANGE_NAME,
      config.exchange.type,
      config.exchange.options,
    );
    await this.channel.assertQueue(QUEUE_NAME);
    await this.channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, '');
  });

  before(function() {
    this.rabbit = new Rabbit({
      url: config.url,
      exchange: {
        name: EXCHANGE_NAME,
        type: 'fanout',
        options: null,
      },
    });
  });

  after(async function() {
    await this.channel.close();
    await this.connection.close();
  });

  after(async function() {
    await this.rabbit.close();
  });

  it('should bind to the exchange and queue', function(done) {
    this.channel.consume(QUEUE_NAME, function() {
      done();
    }, {noAck: true});
    this.rabbit.send({payload: 'test'});
  });
});
