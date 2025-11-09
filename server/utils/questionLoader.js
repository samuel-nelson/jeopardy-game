import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '../data');
const DEFAULT_QUESTIONS_PATH = join(DATA_DIR, 'defaultQuestions.json');
const CUSTOM_QUESTIONS_DIR = join(DATA_DIR, 'custom');

// Ensure directories exist
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}
if (!existsSync(CUSTOM_QUESTIONS_DIR)) {
  mkdirSync(CUSTOM_QUESTIONS_DIR, { recursive: true });
}

export function loadDefaultQuestions() {
  try {
    if (existsSync(DEFAULT_QUESTIONS_PATH)) {
      const data = readFileSync(DEFAULT_QUESTIONS_PATH, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading default questions:', error);
    return null;
  }
}

export function loadCustomQuestionSet(setId) {
  try {
    const filePath = join(CUSTOM_QUESTIONS_DIR, `${setId}.json`);
    if (existsSync(filePath)) {
      const data = readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading custom question set:', error);
    return null;
  }
}

export async function listCustomQuestionSets() {
  try {
    const fs = await import('fs/promises');
    const fileNames = await fs.readdir(CUSTOM_QUESTIONS_DIR);
    const sets = [];
    
    for (const fileName of fileNames) {
      if (fileName.endsWith('.json')) {
        const setId = fileName.replace('.json', '');
        const set = loadCustomQuestionSet(setId);
        if (set) {
          sets.push({
            id: setId,
            name: set.name,
            createdAt: set.createdAt
          });
        }
      }
    }
    
    return sets;
  } catch (error) {
    console.error('Error listing question sets:', error);
    return [];
  }
}

export async function saveCustomQuestionSet(questionSet) {
  try {
    const setId = questionSet.id || uuidv4();
    const filePath = join(CUSTOM_QUESTIONS_DIR, `${setId}.json`);
    
    const setToSave = {
      ...questionSet,
      id: setId,
      createdAt: questionSet.createdAt || new Date().toISOString(),
      isDefault: false
    };
    
    writeFileSync(filePath, JSON.stringify(setToSave, null, 2), 'utf-8');
    return setId;
  } catch (error) {
    console.error('Error saving custom question set:', error);
    throw error;
  }
}

export function deleteCustomQuestionSet(setId) {
  try {
    const filePath = join(CUSTOM_QUESTIONS_DIR, `${setId}.json`);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting custom question set:', error);
    return false;
  }
}

export function validateQuestionSet(questionSet) {
  if (!questionSet.name || !questionSet.categories) {
    return { valid: false, error: 'Missing required fields: name and categories' };
  }
  
  if (!Array.isArray(questionSet.categories) || questionSet.categories.length === 0) {
    return { valid: false, error: 'Must have at least one category' };
  }
  
  for (const category of questionSet.categories) {
    if (!category.name || !category.questions) {
      return { valid: false, error: 'Each category must have a name and questions array' };
    }
    
    if (!Array.isArray(category.questions) || category.questions.length === 0) {
      return { valid: false, error: 'Each category must have at least one question' };
    }
    
    for (const question of category.questions) {
      if (!question.question || !question.answer || !question.value) {
        return { valid: false, error: 'Each question must have question, answer, and value' };
      }
    }
  }
  
  return { valid: true };
}

