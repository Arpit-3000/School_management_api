const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /addSchool
router.post('/addSchool', async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await db.execute(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );
    res.status(201).json({ message: 'School added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err });
  }
});

// GET /listSchools
router.get('/listSchools', async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'User latitude and longitude are required' });
  }

  try {
    const [schools] = await db.execute('SELECT * FROM schools');
    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    const schoolsWithDistance = schools.map(school => {
      const distance = Math.sqrt(
        Math.pow(school.latitude - userLat, 2) +
        Math.pow(school.longitude - userLng, 2)
      );
      return { ...school, distance };
    });

    schoolsWithDistance.sort((a, b) => a.distance - b.distance);
    res.json(schoolsWithDistance);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err });
  }
});

module.exports = router;
