import JSZip from 'jszip';
import { ApiFunction } from '../types';

export const downloadNodeProject = async (func: ApiFunction) => {
  const zip = new JSZip();
  
  // Generate a random secure token for this export
  const apiKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // 1. Generate package.json
  const safeName = func.name.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
  
  const packageJson = {
    name: safeName,
    version: "1.0.0",
    description: func.description || "AI Generated API",
    main: "server.js",
    scripts: {
      "start": "node server.js",
      "dev": "node --watch server.js"
    },
    dependencies: {
      "express": "^4.18.2",
      "cors": "^2.8.5",
      "body-parser": "^1.20.2",
      "mysql2": "^3.9.1",
      "pg": "^8.11.3"
    },
    engines: {
      "node": ">=14.0.0"
    }
  };

  // 2. Generate server.js
  const paramNames = func.parameters.map(p => p.name).join(', ');
  const destructuringLine = paramNames.length > 0 
    ? `const { ${paramNames} } = req.body;` 
    : '';

  const serverJsContent = `
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Database Drivers (Lazy loaded in generated code usually, but required here if used)
// Note: You must configure process.env variables for DB connections

const app = express();
const PORT = process.env.PORT || 3000;

// SECURITY: API Key for authentication
const API_KEY = "${apiKey}";

app.use(cors());
app.use(bodyParser.json());

// Authentication Middleware
const requireAuth = (req, res, next) => {
  // Allow passing token via header 'x-api-key' or query parameter 'api_key'
  const token = req.headers['x-api-key'] || req.query.api_key;
  
  if (!token || token !== API_KEY) {
    return res.status(401).json({ 
      success: false, 
      error: "Unauthorized: Missing or invalid API Key" 
    });
  }
  next();
};

// Generated Function Logic
// Description: ${func.description.replace(/\n/g, ' ')}
const executeLogic = async (req) => {
  // Extract parameters from request body
  ${destructuringLine}

  // --- START OF AI GENERATED CODE ---
  ${func.generatedCode}
  // --- END OF AI GENERATED CODE ---
};

// API Endpoint (Protected)
app.post('/api/${func.name}', requireAuth, async (req, res) => {
  try {
    const result = await executeLogic(req);
    res.json(result);
  } catch (error) {
    console.error("Execution Error:", error.message);
    res.status(400).json({ 
      error: error.message || "An error occurred during execution",
      success: false
    });
  }
});

app.get('/', (req, res) => {
  res.send('API is running. Authentication required for endpoints.');
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
  console.log(\`API Key: \${API_KEY}\`);
  console.log(\`Endpoint: POST /api/${func.name}\`);
});
`;

  // 3. Generate README.md with detailed examples
  
  // Create example payload object
  const examplePayload = func.parameters.reduce((acc, p) => {
    acc[p.name] = p.type === 'number' ? 0 : p.type === 'boolean' ? false : "value";
    return acc;
  }, {} as Record<string, any>);

  const jsonPretty = JSON.stringify(examplePayload, null, 2);
  const jsonMin = JSON.stringify(examplePayload);

  const readmeContent = `
# ${func.name} API (Secured)

${func.description}

## Security

This API is protected by an API Key. You must include this key in all requests.

**API Key:** \`${apiKey}\`

## Database Configuration (If applicable)

If this is a database endpoint, ensure you set your environment variables before running:

\`\`\`bash
# Linux/Mac
export DB_HOST=localhost
export DB_USER=root
export DB_PASS=password
export DB_NAME=mydb

# Windows (PowerShell)
$env:DB_HOST="localhost"
...
\`\`\`

## Quick Start

1.  **Install Dependencies**
    \`\`\`bash
    npm install
    \`\`\`

2.  **Start the Server**
    \`\`\`bash
    npm start
    \`\`\`

## How to Test the API

Endpoint: \`POST http://localhost:3000/api/${func.name}\`

### 1. PowerShell (Windows)
\`\`\`powershell
$headers = @{ "x-api-key" = "${apiKey}" }
Invoke-RestMethod -Uri "http://localhost:3000/api/${func.name}" \`
  -Method Post \`
  -Headers $headers \`
  -ContentType "application/json" \`
  -Body '${jsonMin}'
\`\`\`

### 2. cURL (Terminal)
\`\`\`bash
curl -X POST http://localhost:3000/api/${func.name} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '${jsonMin}'
\`\`\`

### 3. JavaScript / Node.js
\`\`\`javascript
fetch('http://localhost:3000/api/${func.name}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey}'
  },
  body: JSON.stringify(${jsonPretty})
})
.then(res => res.json())
.then(console.log);
\`\`\`

### 4. Postman
1.  Set Method to **POST**.
2.  URL: \`http://localhost:3000/api/${func.name}\`
3.  **Headers** tab: Add a new key \`x-api-key\` with value \`${apiKey}\`.
4.  **Body** tab: Select **raw** > **JSON** and paste the payload.
`;

  // Add files to zip root
  zip.file("package.json", JSON.stringify(packageJson, null, 2));
  zip.file("server.js", serverJsContent.trim());
  zip.file("README.md", readmeContent.trim());

  // Generate and download zip
  const content = await zip.generateAsync({ type: "blob" });
  
  // Trigger download via temporary link
  const url = window.URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}-api-secure.zip`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};