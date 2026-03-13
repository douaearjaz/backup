import { ApiFunction, ExecutionResult } from '../types';

export const executeApiFunction = async (
  func: ApiFunction,
  args: Record<string, any>
): Promise<ExecutionResult> => {
  const startTime = performance.now();

  console.log('[Frontend Execution] Preparing to execute:', func.name);
  console.log('[Frontend Execution] Arguments:', args);

  // 1. Prepare argument values
  const argsPayload: Record<string, any> = {};
  func.parameters.forEach(p => {
    const val = args[p.name];
    // Try to parse JSON strings for object/array types
    if (typeof val === 'string' && (p.type === 'object' || p.type === 'array')) {
        try {
            argsPayload[p.name] = JSON.parse(val);
        } catch (e) {
            console.warn(`Failed to parse JSON for param ${p.name}, sending as string.`);
            argsPayload[p.name] = val;
        }
    } else {
        argsPayload[p.name] = val;
    }
  });
  
  console.log('[Frontend Execution] Payload:', argsPayload);

  // 2. ATTEMPT SERVER-SIDE EXECUTION (Priority)
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
            code: func.generatedCode,
            args: argsPayload
        })
    });

    if (response.ok) {
        const result = await response.json();
        console.log('[Frontend Execution] Server Response:', result);
        return {
            success: result.success,
            data: result.data,
            error: result.error,
            executionTime: result.executionTime
        };
    } else if (response.status === 401 || response.status === 403) {
         return {
            success: false,
            error: "Authentication required to execute code on server.",
            executionTime: performance.now() - startTime
        };
    } else if (response.status === 404) {
        // Server not running or route missing, fall through to client-side
        console.warn("Backend not found, falling back to browser execution.");
    } else {
        // Server error (500, etc)
        const errorData = await response.json();
        console.error('[Frontend Execution] Server Error:', errorData);
        return {
            success: false,
            error: errorData.error || "Server execution failed",
            executionTime: performance.now() - startTime
        };
    }
  } catch (err) {
      console.warn("Network error contacting backend, falling back to browser execution.", err);
  }

  // 3. FALLBACK: BROWSER-SIDE EXECUTION
  try {
    // Check for obviously incompatible code
    if (func.generatedCode.includes('require(')) {
        throw new Error(
            "This function requires a Backend environment (Node.js) because it uses 'require'. " +
            "Please ensure 'npm run server' is running and you are logged in."
        );
    }

    // Quick hack for browser compat: make the function accept 'req'
    const dynamicFunction = new Function('req', func.generatedCode);
    
    const mockReq = { body: argsPayload };
    const result = dynamicFunction(mockReq);

    const finalResult = result instanceof Promise ? await result : result;
    const endTime = performance.now();

    return {
      success: true,
      data: finalResult,
      executionTime: endTime - startTime
    };

  } catch (error: any) {
    const endTime = performance.now();
    return {
      success: false,
      error: error.message || "Execution error",
      executionTime: endTime - startTime
    };
  }
};