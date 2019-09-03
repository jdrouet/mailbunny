const {expect} = require('chai');
const {stringToStream} = require('./helper/stream');
const {streamToString} = require('../source/service/stream');

describe('service/stream', function() {
  it('should convert to stream', function() {
    const input = 'whatever';
    return streamToString(stringToStream(input))
      .then((result) => {
        expect(result).to.eql(input);
      });
  });
});
