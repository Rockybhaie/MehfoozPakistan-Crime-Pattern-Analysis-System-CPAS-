const express = require("express");
const {
  officerSignup,
  officerLogin,
  victimSignup,
  victimLogin,
  witnessSignup,
  witnessLogin,
} = require("../controllers/authController");

const router = express.Router();

// Officer authentication
router.post("/auth/officer/signup", officerSignup);
router.post("/auth/officer/login", officerLogin);

// Victim authentication
router.post("/auth/victim/signup", victimSignup);
router.post("/auth/victim/login", victimLogin);

// Witness authentication
router.post("/auth/witness/signup", witnessSignup);
router.post("/auth/witness/login", witnessLogin);

module.exports = router;
