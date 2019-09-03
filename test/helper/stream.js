const {Readable} = require('stream');

const stringToStream = (value) => {
  const stream = new Readable();
  stream.push(value);
  stream.push(null);
  return stream;
};

module.exports = {
  stringToStream,
};
