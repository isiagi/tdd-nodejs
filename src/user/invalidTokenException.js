module.exports = function InvalidTokenException() {
  this.message = "invalid Token";
  this.status = 400;
};
