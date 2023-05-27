const crypto = require('crypto');

// Function to hash a string using SHA1 algorithm
const sha1Hash = (data) => {
  const sha1 = crypto.createHash('sha1');
  sha1.update(data);
  return sha1.digest('hex');
};

module.exports = { sha1Hash };
