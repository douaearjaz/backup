import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createRequire } from 'module';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_novaforge_key_change_me';
const LOG_FILE = path.resolve('./server.log');

// Database Drivers
const mysql = require('mysql2/promise');
const { Client } = require('pg');

app.use(cors());
app.use(bodyParser.json());

// --- LOGGING UTILITY ---
const log = (message, type = 'INFO') => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}\n`;
    
    // Write to file
    fs.appendFile(LOG_FILE, logMessage, (err) => {
        if (err) console.error("Failed to write to log file:", err);
    });
    
    // Log to console
    console.log(`[${type}] ${message}`);
};

// Middleware to log requests
app.use((req, res, next) => {
    if (req.url !== '/health') { // Skip health check logs
        log(`Incoming Request: ${req.method} ${req.url}`);
    }
    next();
});

// --- DATABASE SETUP (SQLite for Auth & Functions) ---
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        log(`Error opening database: ${err.message}`, 'ERROR');
    } else {
        log('Connected to SQLite database.');
        
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT,
            name TEXT
        )`);

        // API Functions Table
        db.run(`CREATE TABLE IF NOT EXISTS api_functions (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            name TEXT,
            description TEXT,
            parameters TEXT,
            outputType TEXT,
            generatedCode TEXT,
            createdAt INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);
    }
});

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ success: false, error: "Access Denied: No Token Provided" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, error: "Invalid Token" });
        req.user = user;
        next();
    });
};

// --- DB TOOLS ENDPOINTS (Connection & Extraction) ---

// Test Connection
app.post('/api/db/test', authenticateToken, async (req, res) => {
    const { type, host, port, user, password, database } = req.body;
    log(`Testing DB Connection: ${type}://${user}@${host}:${port}/${database}`);

    try {
        if (type === 'mysql') {
            const connection = await mysql.createConnection({ host, port, user, password, database });
            await connection.end();
            log('MySQL Connection Successful');
            res.json({ success: true, message: "Connected successfully to MySQL" });
        } else if (type === 'postgres') {
            const client = new Client({ host, port, user, password, database });
            await client.connect();
            await client.end();
            log('PostgreSQL Connection Successful');
            res.json({ success: true, message: "Connected successfully to PostgreSQL" });
        } else if (type === 'sqlite') {
            res.json({ success: true, message: "SQLite file configuration accepted" });
        } else {
            res.status(400).json({ success: false, error: "Unsupported database type" });
        }
    } catch (err) {
        log(`DB Connection Error: ${err.message}`, 'ERROR');
        res.status(500).json({ success: false, error: err.message });
    }
});

// Extract Schema
app.post('/api/db/schema', authenticateToken, async (req, res) => {
    const { type, host, port, user, password, database } = req.body;
    log(`Extracting Schema for: ${database}`);
    let schemaSQL = "";

    try {
        if (type === 'mysql') {
            const connection = await mysql.createConnection({ host, port, user, password, database });
            const [tables] = await connection.execute('SHOW TABLES');
            
            for (const row of tables) {
                const tableName = Object.values(row)[0];
                try {
                    const [createResult] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
                    schemaSQL += createResult[0]['Create Table'] + ";\n\n";
                } catch (e) {
                    console.warn(`Could not get schema for table ${tableName}`);
                }
            }
            await connection.end();

        } else if (type === 'postgres') {
            const client = new Client({ host, port, user, password, database });
            await client.connect();
            
            const resTables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
            
            for (const row of resTables.rows) {
                const tableName = row.table_name;
                schemaSQL += `CREATE TABLE ${tableName} (\n`;
                
                const resCols = await client.query(`
                    SELECT column_name, data_type, is_nullable 
                    FROM information_schema.columns 
                    WHERE table_name = $1 AND table_schema = 'public'
                `, [tableName]);

                const cols = resCols.rows.map(col => {
                    return `  ${col.column_name} ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`;
                });
                
                schemaSQL += cols.join(",\n");
                schemaSQL += "\n);\n\n";
            }
            await client.end();
        } else {
            return res.json({ success: true, schema: "-- SQLite schema extraction not supported via network yet. Please paste schema manually." });
        }
        
        log(`Schema Extracted (${schemaSQL.length} chars)`);
        res.json({ success: true, schema: schemaSQL || "-- No tables found in public schema." });

    } catch (err) {
        log(`Schema Extraction Error: ${err.message}`, 'ERROR');
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- FUNCTION MANAGEMENT ENDPOINTS ---

// Get all functions for user
app.get('/api/functions', authenticateToken, (req, res) => {
    db.all('SELECT * FROM api_functions WHERE user_id = ? ORDER BY createdAt DESC', [req.user.id], (err, rows) => {
        if (err) {
             log(`DB Error getting functions: ${err.message}`, 'ERROR');
             return res.status(500).json({ success: false, error: err.message });
        }
        
        try {
            const functions = rows.map(row => ({
                ...row,
                parameters: JSON.parse(row.parameters)
            }));
            res.json({ success: true, data: functions });
        } catch (e) {
            log(`JSON Parse Error for functions: ${e.message}`, 'ERROR');
            res.status(500).json({ success: false, error: "Failed to parse function data" });
        }
    });
});

// Get single function
app.get('/api/functions/:id', authenticateToken, (req, res) => {
    db.get('SELECT * FROM api_functions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, error: 'Function not found' });
        
        try {
            const func = {
                ...row,
                parameters: JSON.parse(row.parameters)
            };
            res.json({ success: true, data: func });
        } catch (e) {
            res.status(500).json({ success: false, error: "Failed to parse function data" });
        }
    });
});

// Create or Update function
app.post('/api/functions', authenticateToken, (req, res) => {
    const { id, name, description, parameters, outputType, generatedCode, createdAt } = req.body;
    log(`Saving Function: ${name} (${id})`);
    const userId = req.user.id;
    const paramsString = JSON.stringify(parameters);

    // Using INSERT OR REPLACE to handle both creation and updates
    db.run(`INSERT OR REPLACE INTO api_functions (id, user_id, name, description, parameters, outputType, generatedCode, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, name, description, paramsString, outputType, generatedCode, createdAt],
        function(err) {
             if (err) {
                 log(`Error saving function: ${err.message}`, 'ERROR');
                 return res.status(500).json({ success: false, error: err.message });
             }
             res.json({ success: true, id: id });
        }
    );
});

// Delete function
app.delete('/api/functions/:id', authenticateToken, (req, res) => {
    log(`Deleting function: ${req.params.id}`);
    db.run('DELETE FROM api_functions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (this.changes === 0) return res.status(404).json({ success: false, error: 'Function not found' });
        res.json({ success: true });
    });
});


// --- AUTH ENDPOINTS ---

// Register
app.post('/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    log(`Register attempt: ${email}`);
    if (!email || !password) return res.status(400).json({ error: "Email and Password required" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (email, password, name) VALUES (?, ?, ?)`, 
            [email, hashedPassword, name || 'User'], 
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: "Email already exists" });
                    }
                    log(`Register error: ${err.message}`, 'ERROR');
                    return res.status(500).json({ error: err.message });
                }
                const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' });
                log(`Registered user: ${email} (ID: ${this.lastID})`);
                res.json({ success: true, token, user: { id: this.lastID, email, name } });
            }
        );
    } catch (e) {
        res.status(500).json({ error: "Registration failed" });
    }
});

// Login
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    log(`Login attempt: ${email}`);

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!user) {
            log(`Login failed: User not found (${email})`, 'WARN');
            return res.status(400).json({ error: "User not found" });
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            log(`Login failed: Invalid password (${email})`, 'WARN');
            return res.status(400).json({ error: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        log(`Login successful: ${email}`);
        res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
    });
});

// --- EXECUTION SANDBOX (PROTECTED) ---
app.post('/api/execute', authenticateToken, async (req, res) => {
    const { code, args } = req.body;

    if (!code) return res.status(400).json({ success: false, error: "No code provided" });

    log(`[EXECUTION START] User: ${req.user.email}`);
    log(`[EXECUTION ARGS] ${JSON.stringify(args)}`);
    // Log a preview of the code
    const codePreview = code.length > 200 ? code.substring(0, 200) + '...' : code;
    log(`[EXECUTION CODE] ${codePreview}`);

    try {
        const mockReq = {
            body: args || {},
            headers: req.headers,
            query: req.query,
            user: req.user // Inject user context into the function if needed
        };

        // Capture data if the code uses res.json() or res.send()
        let capturedResult = undefined;
        const mockRes = {
            json: (data) => { capturedResult = data; },
            send: (data) => { capturedResult = data; },
            status: () => mockRes // chainable
        };

        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        
        const wrappedCode = `
            try {
                ${code}
            } catch (err) {
                throw err;
            }
        `;

        // Inject 'res' into the sandbox scope
        const dynamicFn = new AsyncFunction('req', 'res', 'require', wrappedCode);

        const startTime = performance.now();
        let result = await dynamicFn(mockReq, mockRes, require);
        const endTime = performance.now();

        // If function didn't return anything but called res.json(), use that
        if (result === undefined && capturedResult !== undefined) {
            result = capturedResult;
        }

        const executionTime = endTime - startTime;
        log(`[EXECUTION SUCCESS] Time: ${executionTime.toFixed(2)}ms. Result Type: ${typeof result}`);
        if (result === undefined) {
             log(`[EXECUTION WARNING] Result is UNDEFINED. Check if the generated code has a 'return' statement.`, 'WARN');
        } else {
             log(`[EXECUTION RESULT] ${JSON.stringify(result).substring(0, 500)}`); // Log first 500 chars of result
        }

        res.json({
            success: true,
            data: result,
            executionTime: executionTime
        });

    } catch (error) {
        log(`[EXECUTION ERROR] ${error.message}`, 'ERROR');
        log(`[EXECUTION STACK] ${error.stack}`, 'ERROR');
        
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', environment: 'node' });
});

app.listen(PORT, () => {
    console.log(`
    🚀 NovaForge Backend running on http://localhost:${PORT}
    🔒 Auth & Data Persistence Active
    📝 Logs writing to: ${LOG_FILE}
    `);
});