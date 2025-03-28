const escapeKey = function (str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

module.exports = escapeKey;
