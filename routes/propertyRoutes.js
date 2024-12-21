const express = require('express');
const Property = require('../models/property.model');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create Property
router.post('/Properties', authMiddleware, async (req, res) => {
  try {
    const property = new Property({
      images: req.body.images,
      title: req.body.title,
      location: req.body.location,
      description: req.body.description,
      property: req.body.property,
      type: req.body.type,
      bedroom: req.body.bedroom,
      area: req.body.area,
      price: req.body.price,
      negotiationable: req.body.negotiationable,
      createdBy: req.user.userId, 
    });

    const savedProperty = await property.save();
    res.status(201).json(savedProperty);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(400).json({ error: 'An error occurred while creating property' });
  }
});

// Get All Properties
router.get('/Properties', async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while fetching properties' });
  }
});

// Delete Property (Admins Only)
router.delete('/Properties/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete properties' });
    }

    const deletedProperty = await Property.findByIdAndDelete(req.params.id);
    if (!deletedProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while deleting property' });
  }
});

router.get('/Properties/:id',async (req,res) =>{
  try {
    const propertiesId = await Property.findById(req.params.id).populate('createdBy', 'name email role phoneNumber');
    res.json(propertiesId);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while fetching properties' });
  } 
 });

 // Get Properties by User ID
router.get('/Properties/user/:userId', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete properties' });
    }

    const userId = req.params.userId;

    const userProperties = await Property.find({ createdBy: userId }).populate('createdBy', 'name email role');
    res.json(userProperties);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ error: 'An error occurred while fetching user properties' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { location, type, property, bedroom, minPrice, maxPrice } = req.query;

    const filters = {};

    if (location) filters.location = { $regex: location, $options: 'i' };
    if (type) filters.type = { $regex: type, $options: 'i' };
    if (property) filters.property = { $regex: property, $options: 'i' };
    if (bedroom) filters.bedroom = bedroom;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice); 
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    const properties = await Property.find(filters);
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while searching properties' });
  }
});

module.exports = router;
