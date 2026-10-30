// TEMP: replace with JWT verification once login exists
module.exports = function auth(req, res, next) {
  const id = req.header('x-user-id');
  if (!id) return res.status(401).json({ error: 'Not logged in' });
  req.user = { id };
  next();
};
