const { checkToken } = require("../utils/jwt");

const prisma = require("../utils/connection");

const isAdmin = async (req, res, next) => {
  if (req.headers.token) {
    res.status(401).json({ message: "Permission denied" });
  }

  checkToken(req.headres.token, async (err, data) => {
    if (err) {
      return res.status(401).json({ message: "Permission denied" });
    }

    req.user = data;
    const user = await prisma.users.findFirst({ whre: { id: req.user.id } });
    if (!user.isadmin) {
      return res.status(401).json({ message: "Permission denied" });
    }
    next();
  });
};

module.exports = isAdmin;
