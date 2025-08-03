import { z } from "zod";

export interface ParsedConnectionString {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  schema?: string;
  ssl?: boolean;
  [key: string]: any;
}

export interface ParsedConnectionStringPostgres {

  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  [key: string]: any;
}

export interface ConnectionStringValidationResult {
  isValid: boolean;
  error?: string;
  parsed?: ParsedConnectionString|ParsedConnectionStringPostgres;
}

// PostgreSQL connection string parser
export function parsePostgreSQLConnectionString(connectionString: string): ConnectionStringValidationResult {
  try {
    // PostgreSQL format: postgresql://username:password@host:port/database?sslmode=require
    const regex = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?$/;
    const match = connectionString.match(regex);
    
    if (!match) {
      return {
        isValid: false,
        error: "Invalid PostgreSQL connection string format. Expected: postgresql://username:password@host:port/database"
      };
    }

    const [, username, password, host, port, database] = match;
    const urlParams = new URLSearchParams(match[6] || "");
    
    const parsed: ParsedConnectionString|ParsedConnectionStringPostgres = {
      host,
      port: parseInt(port),
      database,
      user: decodeURIComponent(username),
      password: decodeURIComponent(password),
      ssl: urlParams.get("sslmode") === "require"
    };

    // Validate with schema
    const schema = z.object({
      host: z.string().min(1, "Host is required"),
      port: z.number().min(1, "Port must be greater than 0"),
      database: z.string().min(1, "Database is required"),
      user: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
      ssl: z.boolean().optional()
    });

    schema.parse(parsed);

    return {
      isValid: true,
      parsed
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Failed to parse PostgreSQL connection string"
    };
  }
}

// MySQL connection string parser
export function parseMySQLConnectionString(connectionString: string): ConnectionStringValidationResult {
  try {
    // MySQL format: mysql://username:password@host:port/database?ssl=true
    const regex = /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?$/;
    const match = connectionString.match(regex);
    
    if (!match) {
      return {
        isValid: false,
        error: "Invalid MySQL connection string format. Expected: mysql://username:password@host:port/database"
      };
    }

    const [, username, password, host, port, database] = match;
    const urlParams = new URLSearchParams(match[6] || "");
    
    const parsed: ParsedConnectionString = {
      host,
      port: parseInt(port),
      database,
      username: decodeURIComponent(username),
      password: decodeURIComponent(password),
      ssl: urlParams.get("ssl") === "true"
    };

    // Validate with schema
    const schema = z.object({
      host: z.string().min(1, "Host is required"),
      port: z.number().min(1, "Port must be greater than 0"),
      database: z.string().min(1, "Database is required"),
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
      ssl: z.boolean().optional()
    });

    schema.parse(parsed);

    return {
      isValid: true,
      parsed
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Failed to parse MySQL connection string"
    };
  }
}

// SQL Server connection string parser
export function parseSQLServerConnectionString(connectionString: string): ConnectionStringValidationResult {
  try {
    // SQL Server format: sqlserver://username:password@host:port/database?encrypt=true
    const regex = /^sqlserver:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?$/;
    const match = connectionString.match(regex);
    
    if (!match) {
      return {
        isValid: false,
        error: "Invalid SQL Server connection string format. Expected: sqlserver://username:password@host:port/database"
      };
    }

    const [, username, password, host, port, database] = match;
    const urlParams = new URLSearchParams(match[6] || "");
    
    const parsed: ParsedConnectionString = {
      host,
      port: parseInt(port),
      database,
      username: decodeURIComponent(username),
      password: decodeURIComponent(password),
      ssl: urlParams.get("encrypt") === "true"
    };

    // Validate with schema
    const schema = z.object({
      host: z.string().min(1, "Host is required"),
      port: z.number().min(1, "Port must be greater than 0"),
      database: z.string().min(1, "Database is required"),
      username: z.string().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
      ssl: z.boolean().optional()
    });

    schema.parse(parsed);

    return {
      isValid: true,
      parsed
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Failed to parse SQL Server connection string"
    };
  }
}

// Generic connection string parser that detects the type
export function parseConnectionString(connectionString: string, provider: string): ConnectionStringValidationResult {
  switch (provider.toLowerCase()) {
    case 'postgresql':
      return parsePostgreSQLConnectionString(connectionString);
    case 'mysql':
      return parseMySQLConnectionString(connectionString);
    case 'sqlserver':
      return parseSQLServerConnectionString(connectionString);
    default:
      return {
        isValid: false,
        error: `Unsupported provider: ${provider}`
      };
  }
}

// Generate connection string from parsed config
export function generateConnectionString(config: ParsedConnectionString, provider: string): string {
  const { host, port, database, username, password, ssl } = config;
  
  const encodedUsername = encodeURIComponent(username);
  const encodedPassword = encodeURIComponent(password);
  
  let connectionString = '';
  
  switch (provider.toLowerCase()) {
    case 'postgresql':
      connectionString = `postgresql://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
      if (ssl) {
        connectionString += '?sslmode=require';
      }
      break;
    case 'mysql':
      connectionString = `mysql://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
      if (ssl) {
        connectionString += '?ssl=true';
      }
      break;
    case 'sqlserver':
      connectionString = `sqlserver://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
      if (ssl) {
        connectionString += '?encrypt=true';
      }
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
  
  return connectionString;
} 