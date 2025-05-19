import mongoose from 'mongoose';

const strategySchema = new mongoose.Schema({
  strategyName: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  fundamentalCriteria: [{
    type: String,
    required: true
  }],
  technicalPatterns: [{
    type: String,
    required: true
  }],
  riskManagement: [{
    type: String,
    required: true
  }],
  entryExitRules: [{
    type: String,
    required: true
  }],
  sourceBook: {
    type: String,
    required: true
  },
  isProprietary: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
strategySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Strategy = mongoose.model('Strategy', strategySchema); 