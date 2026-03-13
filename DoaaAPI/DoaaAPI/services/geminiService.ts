import { GoogleGenAI, Type } from "@google/genai";
import { ApiFunction, ApiParameter } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFunctionCode = async (
  name: string,
  description: string,
  parameters: ApiParameter[],
  outputType: string
): Promise<string> => {
  const ai = getAiClient();

  const paramDesc = parameters
    .map(p => `${p.name} (${p.type}) - ${p.description || 'No description'}`)
    .join(', ');

  const prompt = `
    You are an expert JavaScript developer. Write the body of a JavaScript function.
    
    Function Name: ${name}
    Description of Logic: ${description}
    Input Parameters: ${paramDesc}
    Expected Output Type: ${outputType}

    Constraints:
    1. WRITE ONLY THE FUNCTION BODY CODE. Do not write the function signature/declaration.
    2. Start by destructuring parameters from 'req.body'. Example: const { param1 } = req.body;
    3. Do not use 'import' or 'require'. Use standard JavaScript methods available in a browser environment (e.g., Math, JSON, Date).
    4. You MUST return a value matching the output type.
    5. Handle potential errors gracefully by throwing an Error with a descriptive message if inputs are invalid.
    
    Example Input:
    Logic: Add two numbers
    Params: a (number), b (number)

    Example Output:
    const { a, b } = req.body;
    if (typeof a !== 'number' || typeof b !== 'number') throw new Error("Inputs must be numbers");
    return a + b;
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.2, 
    }
  });

  let code = response.text || '';
  code = code.replace(/```javascript/g, '').replace(/```/g, '').trim();

  return code;
};

export const generateDatabaseFunctionCode = async (
    dbType: string,
    dbConfig: { host: string; port: string; user: string; password?: string; database: string },
    schema: string,
    queryPrompt: string,
    existingParams: ApiParameter[]
  ): Promise<{ code: string; detectedParams: ApiParameter[] }> => {
    const ai = getAiClient();
  
    const paramDesc = existingParams
      .map(p => `${p.name} (${p.type})`)
      .join(', ');
    
    // Determine logic for password handling
    const hasPassword = !!dbConfig.password;
    const passwordConfig = hasPassword 
      ? `Use this password: "${dbConfig.password}"` 
      : `Password is dynamic. You MUST add 'password' to 'detectedParams' and extract it from 'req.body'.`;

    const prompt = `
      You are an expert Backend Developer. 
      
      Goal: Write the Node.js execution logic to run this query: "${queryPrompt}"
      Database Type: ${dbType}
      
      Database Configuration:
      - Host: ${dbConfig.host}
      - Port: ${dbConfig.port}
      - User: ${dbConfig.user}
      - Database Name: ${dbConfig.database}
      - Password Config: ${passwordConfig}
      
      Database Schema: 
      ${schema}
      
      User Defined Params: ${paramDesc}
  
      Instructions:
      1. **CRITICAL**: Start the code by destructuring ALL dynamic input parameters (including 'password' if needed) from 'req.body'. 
         Example: const { id, password } = req.body;
      2. Write the EXECUTABLE BODY code directly. 
      3. **DO NOT** wrap the code in a function definition (like 'const handler = ...').
      4. **DO NOT** use 'res.json()'. Instead, strictly **RETURN** the result data using the 'return' keyword at the end.
      5. Use 'mysql2/promise' or 'pg' via 'require'.
      6. Embed the DB credentials (except password if dynamic).
      7. Connect, execute query, close connection, and RETURN the data.
      
      Example Correct Output Structure:
      const { id, password } = req.body;
      const { Client } = require('pg');
      const client = new Client({ 
          host: '...', 
          password: password, // Uses variable from destructuring
          ... 
      });
      await client.connect();
      const res = await client.query('SELECT * FROM users WHERE id = $1', [id]);
      await client.end();
      return res.rows;

      Output JSON Schema:
      {
        "code": "string",
        "detectedParams": [
            { "id": "string", "name": "string", "type": "string", "required": boolean, "description": "string" }
        ]
      }
    `;
  
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });
  
    try {
        const result = JSON.parse(response.text || '{}');
        return {
            code: result.code || '// Error generating code',
            detectedParams: result.detectedParams || []
        };
    } catch (e) {
        console.error("Failed to parse JSON response from Gemini", e);
        return { code: '// Error parsing generation response', detectedParams: [] };
    }
  };