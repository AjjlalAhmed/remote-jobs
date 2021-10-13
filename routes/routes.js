// Importing thing we need
const express = require("express");
const apiController = require("../controller/apiController");
// Creating router
const router = express.Router();
// Routes
router.get("/", apiController.sendHTML);
router.get("/api/createjobs", apiController.createJobs);
router.get("/api/getjobs", apiController.getJobs);
// Exporting router
module.exports = router;