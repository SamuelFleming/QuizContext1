// server/src/middleware/evidence/loadOwnedExperience.js

const Experience = require('../../models/Experience');

const loadOwnedExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findOne({
      _id: req.params.experienceId,
      userId: req.user.userId,
      isArchived: false,
    });

    if (!experience) {
      return res.status(404).json({
        message: 'Experience not found',
      });
    }

    req.experience = experience;
    return next();
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Experience error',
    });
  }
};

module.exports = loadOwnedExperience;
