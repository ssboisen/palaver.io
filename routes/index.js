exports.index = function(req, res) {
  res.render('index', { title: "palaver" });
};

exports.login = function(req, res) {
	res.render('login', { title: "palaver > login" });
};
