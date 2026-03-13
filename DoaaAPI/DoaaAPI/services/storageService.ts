import { ApiFunction } from '../types';

const getHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getFunctions = async (): Promise<ApiFunction[]> => {
  try {
    const response = await fetch('/api/functions', {
        headers: getHeaders()
    });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Failed to load functions", error);
    return [];
  }
};

export const getFunctionById = async (id: string): Promise<ApiFunction | undefined> => {
  try {
    const response = await fetch(`/api/functions/${id}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    return data.success ? data.data : undefined;
  } catch (error) {
    console.error("Failed to load function", error);
    return undefined;
  }
};

export const saveFunction = async (func: ApiFunction): Promise<void> => {
  try {
    const response = await fetch('/api/functions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(func)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
  } catch (error) {
      console.error("Failed to save function", error);
      throw error;
  }
};

export const deleteFunction = async (id: string): Promise<void> => {
  try {
    await fetch(`/api/functions/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
  } catch (error) {
      console.error("Failed to delete function", error);
  }
};