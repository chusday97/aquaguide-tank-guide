import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import {
  evaluationCaseSchema,
  evaluationResultSchema,
  type EvaluationCase,
  type EvaluationResult,
} from '../schemas/evaluation-case.schema';

export const projectRoot = resolve(import.meta.dirname, '../..');
export const reportsDir = resolve(projectRoot, 'evaluation/reports');

export const readJsonLines = <T>(path: string, parse: (value: unknown) => T): T[] => {
  const absolutePath = resolve(projectRoot, path);
  const content = readFileSync(absolutePath, 'utf8').trim();
  if (!content) return [];
  return content.split(/\r?\n/).filter(Boolean).map((line, index) => {
    try {
      return parse(JSON.parse(line));
    } catch (error) {
      throw new Error(`${path}:${index + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
};

export const readEvaluationCases = (files: string[]): EvaluationCase[] => files.flatMap(file => (
  readJsonLines(file, value => evaluationCaseSchema.parse(value))
));

export const writeResults = (name: string, results: EvaluationResult[]) => {
  const path = resolve(reportsDir, `${name}.json`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(results.map(result => evaluationResultSchema.parse(result)), null, 2));
  return path;
};

export const readResultFile = (name: string): EvaluationResult[] => {
  const path = resolve(reportsDir, `${name}.json`);
  try {
    const value = JSON.parse(readFileSync(path, 'utf8'));
    return evaluationResultSchema.array().parse(value);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
};
