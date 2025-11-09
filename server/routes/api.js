import express from 'express';
import {
  loadDefaultQuestions,
  loadCustomQuestionSet,
  listCustomQuestionSets,
  saveCustomQuestionSet,
  deleteCustomQuestionSet,
  validateQuestionSet
} from '../utils/questionLoader.js';

const router = express.Router();

// Get default questions
router.get('/questions/default', (req, res) => {
  try {
    const questions = loadDefaultQuestions();
    if (questions) {
      res.json(questions);
    } else {
      res.status(404).json({ error: 'Default questions not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error loading default questions' });
  }
});

// Get all custom question sets
router.get('/questions/custom', async (req, res) => {
  try {
    const sets = await listCustomQuestionSets();
    res.json(sets);
  } catch (error) {
    res.status(500).json({ error: 'Error listing custom question sets' });
  }
});

// Get a specific custom question set
router.get('/questions/custom/:id', (req, res) => {
  try {
    const setId = req.params.id;
    const set = loadCustomQuestionSet(setId);
    if (set) {
      res.json(set);
    } else {
      res.status(404).json({ error: 'Question set not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error loading question set' });
  }
});

// Save a custom question set
router.post('/questions/custom', async (req, res) => {
  try {
    const questionSet = req.body;
    const validation = validateQuestionSet(questionSet);
    
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const setId = await saveCustomQuestionSet(questionSet);
    res.json({ id: setId, message: 'Question set saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error saving question set' });
  }
});

// Delete a custom question set
router.delete('/questions/custom/:id', (req, res) => {
  try {
    const setId = req.params.id;
    const deleted = deleteCustomQuestionSet(setId);
    if (deleted) {
      res.json({ message: 'Question set deleted successfully' });
    } else {
      res.status(404).json({ error: 'Question set not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting question set' });
  }
});

export default router;

