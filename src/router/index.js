const router = require("express").Router();
//routes

router.use("/auth", require("./api/auth.routes"));
router.use("/appointment", require("./api/appointment.routes"));
router.use("/categories", require("./api/categories.routes"));
router.use("/blogs", require("./api/blogs.routes"));
router.use("/contacts", require("./api/contactus.routes.js"));
router.use("/newsletter", require("./api/newsletter.routes.js"));
router.use("/gallery", require("./api/gallery.routes"));
module.exports = router;
