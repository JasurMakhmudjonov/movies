const { Router } = require("express");
const router = Router();

const route = "/auth";
const { register, login, verify } = require("../controllers/auth.controller");
const isAuth = require("../middlewares/is-auth.middleware");
const isAdmin = require("../middlewares/is-admin.middlewares");



router.post(`${route}/login`, isAuth, login);
router.post(`${route}/register`, register);
router.post(`${route}/verify`, verify);

module.exports = router;


