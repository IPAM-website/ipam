import postgres, {type Sql } from 'postgres';
import type { RequestEventBase } from '@builder.io/qwik-city';

type EnvLike = RequestEventBase['env'] | NodeJS.ProcessEnv;

function getEnvVar(env: EnvLike, key: string): string | undefined {
  // Se è un oggetto Qwik, ha il metodo get
  if (typeof (env as any).get === 'function') {
    return (env as RequestEventBase['env']).get(key);
  }
  // Altrimenti è process.env
  return (env as NodeJS.ProcessEnv)[key];
}
let sql: Sql | null = null

export function createSqlClient(env: EnvLike) {
  if(sql) return sql;
  const hostname = getEnvVar(env, 'POSTGRES_HOST');
  const username = getEnvVar(env, 'POSTGRES_USER');
  const password = getEnvVar(env, 'POSTGRES_PASSWORD');
  const db = getEnvVar(env, 'POSTGRES_DB');
  const portEnv = getEnvVar(env, 'POSTGRES_PORT');

  if (!hostname || !username || !password || !db) {
    console.error('CRITICAL: Missing one or more PostgreSQL environment variables');
    throw new Error('Server database configuration is incomplete');
  }

  const port = portEnv ? parseInt(portEnv, 10) : 5432;
  sql = postgres({
    host: hostname,
    username,
    password,
    db,
    port,
    max: 20,
    idle_timeout: 30,
    connect_timeout: 5,
  });

  return sql;
}

export const sqlForQwik = (env: RequestEventBase['env']) => createSqlClient(env);