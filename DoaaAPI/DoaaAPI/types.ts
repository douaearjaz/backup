export type ParamType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface ApiParameter {
  id: string;
  name: string;
  type: ParamType;
  required: boolean;
  description?: string;
}

export interface ApiFunction {
  id: string;
  name: string;
  description: string;
  parameters: ApiParameter[];
  outputType: string;
  generatedCode: string; // The function body
  createdAt: number;
}

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}
