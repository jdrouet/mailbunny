const sinon = require('sinon');
const {expect} = require('chai');
const EventEmitter = require('events');
const {stringToStream} = require('./helper/stream');
const Mailer = require('../source/service/mail');

describe('service/mail', function() {
  beforeEach(function() {
    this.mailer = new Mailer({
      host: 'localhost',
    });
    this.clientMock = sinon.mock(this.mailer._client);
    this.mailerMock = sinon.mock(this.mailer);
  });

  afterEach(function() {
    this.clientMock.restore();
    this.mailerMock.restore();
  });

  describe('connect', function() {
    it('should just call connect from the client', function() {
      this.clientMock.expects('connect').once();
      this.mailer.connect();
      this.clientMock.verify();
    });
  });

  describe('connect', function() {
    it('should just call connect from the client', function() {
      this.clientMock.expects('connect').once();
      this.mailer.connect();
      this.clientMock.verify();
    });
  });

  describe('handleReady', function() {
    it('should emit an end event', function(done) {
      this.mailer.once('end', done);
      this.mailer.handleEnd();
    });
  });

  describe('handleReady', function() {
    it('should open the box', function() {
      this.clientMock.expects('openBox').once().withArgs('INBOX', false);
      this.mailer.handleReady();
      this.clientMock.verify();
    });
  });

  describe('handleOpen', function() {
    it('should throw an error if cannot open', function(done) {
      this.mailer.once('error', function() {
        done();
      });
      this.mailer.handleOpen(new Error('ooops'));
    });

    it('should not throw an error if no error', function(done) {
      this.mailer.once('error', function() {
        done(new Error('should not!'));
      });
      this.mailer.handleOpen();
      setTimeout(done, 50);
    });
  });

  describe('handleMail', function() {
    it('should search', function() {
      this.clientMock.expects('search').once().withArgs(['UNSEEN']);
      this.mailer.handleMail();
      this.clientMock.verify();
    });
  });

  describe('handleSearch', function() {
    it('should throw an error if cannot search', function(done) {
      this.mailer.once('error', function() {
        done();
      });
      this.mailer.handleSearch(new Error('ooops'));
    });

    it('should fetch when messages', function(done) {
      const response = 'response';
      const emitter = new EventEmitter();
      const msg = new EventEmitter();
      this.clientMock.expects('fetch').once().withArgs(response, {
        bodies: ['HEADER', 'TEXT'],
        markSeen: true,
      }).returns(emitter);
      this.mailer.on('message', (received) => {
        expect(received).to.be.an('object');
        expect(received).to.have.property('header', 'coucou');
        this.clientMock.verify();
        done();
      });
      this.mailerMock.expects('trashMessage').once();
      setTimeout(function() {
        emitter.emit('message', msg);
      }, 100);
      setTimeout(function() {
        msg.emit('attributes', 'coucou');
      }, 200);
      setTimeout(function() {
        msg.emit('body', stringToStream('body-body-body-body'));
      }, 200);
      setTimeout(function() {
        msg.emit('end');
      }, 300);
      this.mailer.handleSearch(null, response);
    });
  });

  describe('trashMessage', function() {
    it('should throw an error', function(done) {
      const message = {header: {uid: 42}};
      this.clientMock.expects('addFlags').once()
        .withArgs(message.header.uid, '\\Deleted')
        .callsFake((uid, flag, callback) => {
          callback(new Error('oops'));
        });
      this.mailer.on('error', (err) => {
        expect(err).to.exist;
        this.clientMock.verify();
        done();
      });
      this.mailer.trashMessage(message);
    });

    it('should set flag', function() {
      const message = {
        header: {
          uid: 42,
        },
      };
      this.clientMock.expects('addFlags').once()
        .withArgs(message.header.uid, '\\Deleted')
        .callsFake((uid, flag, callback) => {
          callback();
        });
      this.mailer.trashMessage(message);
      this.clientMock.verify();
    });
  });
});
