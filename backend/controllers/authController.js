const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  findOfficerByEmail,
  createOfficer,
} = require("../models/OfficerModel");
const { findVictimByEmail, createVictim } = require("../models/VictimModel");
const {
  findWitnessByEmail,
  createWitness,
} = require("../models/WitnessModel");

// Email validation helper function
function isValidEmail(email) {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailRegex.test(email);
 }

/**
 * Officer Signup (Admin only - for creating new officers)
 */
async function officerSignup(req, res) {
  const { name, email, password, contactNo } = req.body;
  try {
    // Validate email format
    if (!isValidEmail(email)) {
       return res.status(400).json({ error: "Invalid email format. Email must contain @ symbol" });
     }

    // Check if officer already exists
    const existingOfficer = await findOfficerByEmail(email);
    if (existingOfficer) {
      return res.status(400).json({ error: "Officer with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createOfficer({ name, email, password: hashedPassword, contactNo });
    res.status(201).json({ message: "Officer registered successfully" });
  } catch (error) {
    console.error("Officer signup error:", error);
    res.status(500).json({ error: "Server error during officer registration" });
  }
}

/**
 * Officer Login
 */
async function officerLogin(req, res) {
  const { email, password } = req.body;
  try {
    console.log('🔍 Login attempt for:', email);
    const officer = await findOfficerByEmail(email);
    console.log('👤 Officer found:', officer ? 'Yes' : 'No');
    if (!officer) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Officer array: [Officer_ID, Name, Email, Contact_No, Password]
    console.log('📋 Officer data structure:', typeof officer, Array.isArray(officer), officer);
    const officerPassword = officer[4]; // Password is at index 4
    console.log('🔑 Password check - Index 4:', officerPassword ? 'EXISTS' : 'NULL');
    if (!officerPassword) {
      return res.status(400).json({ error: "Password not set. Please contact admin." });
    }

    const isMatch = await bcrypt.compare(password, officerPassword);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: officer[0], role: "OFFICER", email: officer[2] },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: officer[0],
        name: officer[1],
        email: officer[2],
        role: "OFFICER",
      },
    });
  } catch (error) {
    console.error("Officer login error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Victim Signup
 */
async function victimSignup(req, res) {
  const { name, email, password, age, gender, contactInfo, address } = req.body;
  try {
    // Validate email format
    if (!isValidEmail(email)) {
     return res.status(400).json({ error: "Invalid email format. Email must contain @ symbol" });
    }

    // Check if victim already exists
    const existingVictim = await findVictimByEmail(email);
    if (existingVictim) {
      return res.status(400).json({ error: "Account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createVictim({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      contactInfo,
      address,
    });
    res.status(201).json({ message: "Victim account created successfully" });
  } catch (error) {
    console.error("Victim signup error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
}

/**
 * Victim Login
 */
async function victimLogin(req, res) {
  const { email, password } = req.body;
  try {
    console.log('🔍 Victim login attempt for:', email);
    const victim = await findVictimByEmail(email);
    console.log('👤 Victim found:', victim ? 'Yes' : 'No');
    if (!victim) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Victim is returned as object with properties: VICTIM_ID, NAME, EMAIL, PASSWORD, etc.
    console.log('📋 Victim data:', victim);
    const victimPassword = victim.PASSWORD;
    console.log('🔑 Password check:', victimPassword ? 'EXISTS' : 'NULL');
    if (!victimPassword) {
      return res.status(400).json({ error: "Password not set. Please contact admin." });
    }

    const isMatch = await bcrypt.compare(password, victimPassword);
    console.log('🔐 Password match:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: victim.VICTIM_ID, role: "VICTIM", email: victim.EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: victim.VICTIM_ID,
        name: victim.NAME,
        email: victim.EMAIL,
        role: "VICTIM",
      },
    });
  } catch (error) {
    console.error("❌ Victim login error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Witness Signup
 */
async function witnessSignup(req, res) {
  const { name, email, password, contactInfo, address } = req.body;
  try {
    //Validate email format
    if (!isValidEmail(email)) {
       return res.status(400).json({ error: "Invalid email format. Email must contain @ symbol" });
     }

    // Check if witness already exists
    const existingWitness = await findWitnessByEmail(email);
    if (existingWitness) {
      return res.status(400).json({ error: "Account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createWitness({
      name,
      email,
      password: hashedPassword,
      contactInfo,
      address,
    });
    res.status(201).json({ message: "Witness account created successfully" });
  } catch (error) {
    console.error("Witness signup error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
}

/**
 * Witness Login
 */
async function witnessLogin(req, res) {
  const { email, password } = req.body;
  try {
    console.log('🔍 Witness login attempt for:', email);
    const witness = await findWitnessByEmail(email);
    console.log('👤 Witness found:', witness ? 'Yes' : 'No');
    if (!witness) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Witness is returned as object with properties: WITNESS_ID, NAME, EMAIL, PASSWORD, etc.
    console.log('📋 Witness data:', witness);
    const witnessPassword = witness.PASSWORD;
    console.log('🔑 Password check:', witnessPassword ? 'EXISTS' : 'NULL');
    if (!witnessPassword) {
      return res.status(400).json({ error: "Password not set. Please contact admin." });
    }

    const isMatch = await bcrypt.compare(password, witnessPassword);
    console.log('🔐 Password match:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: witness.WITNESS_ID, role: "WITNESS", email: witness.EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: witness.WITNESS_ID,
        name: witness.NAME,
        email: witness.EMAIL,
        role: "WITNESS",
      },
    });
  } catch (error) {
    console.error("❌ Witness login error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  officerSignup,
  officerLogin,
  victimSignup,
  victimLogin,
  witnessSignup,
  witnessLogin,
};
