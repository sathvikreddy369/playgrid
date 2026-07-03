import { Request, Response, NextFunction } from 'express';

// Recursively sanitize input to prevent XSS attacks
const cleanString = (val: string): string => {
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const cleanData = (data: any): any => {
  if (typeof data === 'string') {
    return cleanString(data);
  }
  if (Array.isArray(data)) {
    return data.map(item => cleanData(item));
  }
  if (data !== null && typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        cleaned[key] = cleanData(data[key]);
      }
    }
    return cleaned;
  }
  return data;
};

export const xssClean = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = cleanData(req.body);
  }
  if (req.query) {
    const sanitizedQuery = cleanData(req.query);
    Object.defineProperty(req, 'query', {
      value: sanitizedQuery,
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  if (req.params) {
    const sanitizedParams = cleanData(req.params);
    Object.defineProperty(req, 'params', {
      value: sanitizedParams,
      writable: true,
      configurable: true,
      enumerable: true
    });
  }
  next();
};
