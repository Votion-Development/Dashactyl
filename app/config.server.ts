import dotenv from 'dotenv';

const env = dotenv.config().parsed || {};

export function getVar(name: string): string | undefined {
  return env[name];
}

export function setVar(name: string, value: string): void {
  env[name] = value;
}
