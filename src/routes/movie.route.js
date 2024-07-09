const {Router} = require("express");
const router = Router();


const route = "/movie"

const {create, show, update, remove} = require("../controllers/movies.controllers");
const isAuth = require("../middlewares/is-auth.middleware");
const isAdmin = require("../middlewares/is-admin.middlewares");

router.post(`${route}/`, isAdmin, create)
router.get(`${route}/`, isAuth, show)
router.put(`${route}/:id`,isAdmin, update)
router.delete(`${route}/:id`, isAdmin, remove)

module.exports = router;