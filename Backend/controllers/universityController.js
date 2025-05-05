// controllers/universityController.js
const express = require("express");
const router = express.Router();
const university = require("../models/university");

// GET /api/universitys
// Fetch all universitys, ordered by global rank
router.get("/", async (req, res) => {
  try {
    const list = await university.findAll({
      order: [["university_global_rank", "ASC"]],
    });
    return res.status(200).json({ success: true, data: list });
  } catch (err) {
    console.error("Error fetching universitys:", err);
    return res.status(500).json({ error: "Failed to fetch universitys" });
  }
});

// GET /api/universitys/:universityId
// Fetch a single university by its ID
router.get("/:universityId", async (req, res) => {
  const { universityId } = req.params;
  try {
    const university = await university.findByPk(universityId);
    if (!university) {
      return res.status(404).json({ message: "university not found" });
    }
    return res.status(200).json({ success: true, data: university });
  } catch (err) {
    console.error(`Error fetching university ${universityId}:`, err);
    return res.status(500).json({ error: "Failed to fetch university" });
  }
});

module.exports = router;
