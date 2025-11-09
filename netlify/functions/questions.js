// Netlify Function for question management
const fs = require('fs');
const path = require('path');
const defaultQuestions = require('./defaultQuestions');

// In-memory storage for custom questions (in production, use a database)
let customQuestions = {};

// Load default questions
function loadDefaultQuestions() {
  try {
    // First try embedded questions
    if (defaultQuestions && defaultQuestions.categories) {
      return defaultQuestions;
    }
    
    // Fallback: Try multiple possible paths
    const possiblePaths = [
      path.join(__dirname, '../server/data/defaultQuestions.json'),
      path.join(__dirname, '../../server/data/defaultQuestions.json'),
      path.join(process.cwd(), 'server/data/defaultQuestions.json')
    ];
    
    for (const defaultPath of possiblePaths) {
      if (fs.existsSync(defaultPath)) {
        const data = fs.readFileSync(defaultPath, 'utf-8');
        return JSON.parse(data);
      }
    }
    
    console.error('Default questions file not found in any expected location');
    return null;
  } catch (error) {
    console.error('Error loading default questions:', error);
    return null;
  }
}

// Load custom questions from file system (Netlify Functions have write access)
function loadCustomQuestions() {
  try {
    // Try multiple possible paths
    const possibleDirs = [
      path.join(__dirname, '../server/data/custom'),
      path.join(__dirname, '../../server/data/custom'),
      path.join(process.cwd(), 'server/data/custom'),
      path.join('/tmp', 'jeopardy-custom-questions') // Fallback to /tmp for Netlify
    ];
    
    let customDir = null;
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        customDir = dir;
        break;
      }
    }
    
    // If no directory exists, create one in /tmp (Netlify writable location)
    if (!customDir) {
      customDir = path.join('/tmp', 'jeopardy-custom-questions');
      fs.mkdirSync(customDir, { recursive: true });
      return {};
    }
    
    const files = fs.readdirSync(customDir);
    const questions = {};
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const setId = file.replace('.json', '');
        const filePath = path.join(customDir, file);
        const data = fs.readFileSync(filePath, 'utf-8');
        questions[setId] = JSON.parse(data);
      }
    });
    
    return questions;
  } catch (error) {
    console.error('Error loading custom questions:', error);
    return {};
  }
}

// Save custom question set
function saveCustomQuestionSet(questionSet) {
  try {
    // Use /tmp for Netlify (writable location)
    const customDir = path.join('/tmp', 'jeopardy-custom-questions');
    if (!fs.existsSync(customDir)) {
      fs.mkdirSync(customDir, { recursive: true });
    }
    
    const setId = questionSet.id || `custom-${Date.now()}`;
    const filePath = path.join(customDir, `${setId}.json`);
    
    const setToSave = {
      ...questionSet,
      id: setId,
      createdAt: questionSet.createdAt || new Date().toISOString(),
      isDefault: false
    };
    
    fs.writeFileSync(filePath, JSON.stringify(setToSave, null, 2), 'utf-8');
    return setId;
  } catch (error) {
    console.error('Error saving custom question set:', error);
    throw error;
  }
}

// Initialize on first load
if (Object.keys(customQuestions).length === 0) {
  customQuestions = loadCustomQuestions();
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Handle both direct path and query parameter
  let requestPath = event.path;
  if (event.queryStringParameters && event.queryStringParameters.path) {
    requestPath = event.queryStringParameters.path;
  }
  
  const pathParts = requestPath.split('/').filter(Boolean);
  const resource = pathParts[pathParts.length - 1];
  const setId = pathParts[pathParts.length - 2] === 'custom' ? pathParts[pathParts.length - 1] : null;

  try {
    // GET /api/questions/default
    if (event.httpMethod === 'GET' && resource === 'default') {
      const questions = loadDefaultQuestions();
      if (questions) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(questions)
        };
      }
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Default questions not found' })
      };
    }

    // GET /api/questions/custom
    if (event.httpMethod === 'GET' && pathParts[pathParts.length - 2] === 'custom' && !setId) {
      customQuestions = loadCustomQuestions();
      const sets = Object.keys(customQuestions).map(id => ({
        id,
        name: customQuestions[id].name,
        createdAt: customQuestions[id].createdAt
      }));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(sets)
      };
    }

    // GET /api/questions/custom/:id
    if (event.httpMethod === 'GET' && setId) {
      customQuestions = loadCustomQuestions();
      const set = customQuestions[setId];
      if (set) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(set)
        };
      }
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Question set not found' })
      };
    }

    // POST /api/questions/custom
    if (event.httpMethod === 'POST' && resource === 'custom') {
      const questionSet = JSON.parse(event.body);
      
      // Validation
      if (!questionSet.name || !questionSet.categories) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing required fields' })
        };
      }

      const savedId = saveCustomQuestionSet(questionSet);
      customQuestions = loadCustomQuestions();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ id: savedId, message: 'Question set saved successfully' })
      };
    }

    // DELETE /api/questions/custom/:id
    if (event.httpMethod === 'DELETE' && setId) {
      const customDir = path.join('/tmp', 'jeopardy-custom-questions');
      const filePath = path.join(customDir, `${setId}.json`);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        customQuestions = loadCustomQuestions();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Question set deleted successfully' })
        };
      }

      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Question set not found' })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

