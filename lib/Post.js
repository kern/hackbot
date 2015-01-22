var Post = module.exports = function(id) {
  this.id = id;
  this.from = '';
  this.message = '';
};

Post.fromRaw = function(raw) {
  var post = new Post(raw.id);
  post.from = raw.from.id;
  post.message = raw.message;
  return post;
};

Post.adminIDs = Post.adminIDs || [];

Post.prototype.isAdmin = function() {
  return Post.adminIDs.indexOf(this.from) !== -1;
};

Post.prototype.hasCommand = function(cmd) {
  return this.message.match('^/' + cmd + '(?: |$)');
};
