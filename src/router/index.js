const router = require("express").Router();
//routes

router.use("/auth", require("./api/auth.routes"));
router.use("/appointment", require("./api/appointment.routes"));
router.use("/categories", require("./api/categories.routes"));
router.use("/blogs", require("./api/blogs.routes"));
router.use("/handling_tools", require("./api/tools.routes.js"));
router.use("/tool_types", require("./api/types.routes.js"));
router.use("/manufacturers", require("./api/manufacturer.routes.js"));
router.use("/models", require("./api/model.routes.js"));
router.use("/results", require("./api/results.routes.js"));
router.use("/contacts", require("./api/contactus.routes.js"));
router.use("/newsletter", require("./api/newsletter.routes.js"));
module.exports = router;
