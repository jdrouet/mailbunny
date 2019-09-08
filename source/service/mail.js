const createDebug = require('debug');
const debug = createDebug('mailbunny:service:mailer');
const Emitter = require('events');
const Imap = require('imap');
const {streamToString} = require('./stream');

class Mailer extends Emitter {
  constructor(cfg) {
    super();
    this._client = new Imap({...cfg, debug: createDebug('node-imap')});
    this._client.on('mail', this.handleMail.bind(this));
    this._client.on('error', this.handleError.bind(this));
    this._client.on('end', this.handleError.bind(this));
    this._client.on('ready', this.handleReady.bind(this));
  }

  connect() {
    debug('connect');
    this._client.connect();
  }

  trashMessage(message) {
    debug('trash message', message.header.uid);
    this._client.addFlags(message.header.uid, '\\Deleted', (err) => {
      if (err) this.handleError(err);
    });
  }

  handleEnd() {
    this.emit('end');
  }

  handleError(err) {
    this.emit('error', err);
  }

  handleOpen(err) {
    if (err) {
      return this.handleError(err);
    }
  }

  handleMail() {
    debug('search unseen');
    this._client.search(['UNSEEN'], this.handleSearch.bind(this));
  }

  handleMessage(msg, seqno) {
    debug('message received', seqno);
    const message = {
      header: null,
      body: null,
    };
    msg.on('body', (stream) => {
      streamToString(stream).then((body) => {
        message.body = body;
      });
    });
    msg.once('attributes', (header) => {
      message.header = header;
    });
    msg.once('end', () => {
      this.trashMessage(message);
      this.emit('message', message);
    });
  }

  handleReady() {
    debug('connection ready');
    this._client.openBox('INBOX', false, this.handleOpen.bind(this));
  }

  handleSearch(err, res) {
    if (err) {
      return this.handleError(err);
    }
    if (res.length === 0) {
      return;
    }
    debug('fetch messages');
    const fetch = this._client.fetch(res, {
      bodies: ['HEADER', 'TEXT'],
      markSeen: true,
    });
    fetch.on('message', this.handleMessage.bind(this));
    fetch.once('end', () => debug('finished fetching messages'));
    fetch.once('error', (error) => debug('error fetching messages', error));
  }
}

module.exports = Mailer;
