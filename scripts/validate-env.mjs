#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { collectEnvIssues } from '../src/app/lib/envValidation.js';

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith('#'))
    .reduce((acc, line) => {
      const index = line.indexOf('=');
      if (index === -1) {
        return acc;
      }
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim();
      if (key) {
        acc[key] = value.replace(/^"|"$/g, '');
      }
      return acc;
    }, {});
};

const envFilePath = path.resolve(process.cwd(), '.env');
const fileEnv = parseEnvFile(envFilePath);
const mergedEnv = { ...fileEnv, ...process.env };

const issues = collectEnvIssues({}, mergedEnv);

const hasErrors = issues.some((issue) => issue.severity === 'error');
const warnings = issues.filter((issue) => issue.severity === 'warning');

if (issues.length === 0) {
  console.log('Environment looks good ✅');
} else {
  issues.forEach((issue) => {
    const prefix = issue.severity === 'error' ? 'ERROR' : 'WARN';
    console.log(`${prefix}: ${issue.message}`);
    if (issue.suggestion) {
      console.log(`  → ${issue.suggestion}`);
    }
  });
}

if (!hasErrors && warnings.length > 0) {
  console.log('\nWarnings detected. Use --no-warn to ignore for CI checks if needed.');
}

process.exit(hasErrors ? 1 : 0);
