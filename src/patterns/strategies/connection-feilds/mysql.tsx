// Strategy pattern for rendering connection fields

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConnectionFieldsStrategy } from "./index";
import { z } from "zod";
import { sanitizeField } from "@/lib/sanitize";
import { parseMySQLConnectionString } from "@/lib/connection-string-parser";
import { useState } from "react";

export class MySQLFieldsStrategy implements ConnectionFieldsStrategy {
    getDefaults(): Record<string, any> {
        return {
            connectionString: ""
        }
    }
    getSchema(): z.ZodObject<any> {
        return z.object({
            name: z.string().min(1, "Name is required"),
            connectionString: z.string().min(1, "Connection string is required")
        })
    }
    renderFields(config: Record<string, any>, setConfig: (config: Record<string, any>) => void, errors?: Record<string, string>): React.ReactNode {
        const [connectionStringError, setConnectionStringError] = useState<string>("");

        const handleConnectionStringChange = (connectionString: string) => {
            setConnectionStringError("");
            
            if (!connectionString.trim()) {
                setConfig({ ...config, connectionString: "" });
                return;
            }

            const result = parseMySQLConnectionString(connectionString);
            
            if (result.isValid && result.parsed) {
                setConfig({
                    ...config,
                    connectionString,
                    host: result.parsed.host,
                    port: result.parsed.port,
                    database: result.parsed.database,
                    user: result.parsed.username,
                    password: result.parsed.password,
                    ssl: result.parsed.ssl
                });
            } else {
                setConnectionStringError(result.error || "Invalid connection string");
                setConfig({ ...config, connectionString });
            }
        };

        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="connectionString">MySQL Connection String</Label>
                    <Input
                        id="connectionString"
                        placeholder="mysql://username:password@host:port/database?ssl=true"
                        value={config.connectionString || ""}
                        onChange={(e) => handleConnectionStringChange(e.target.value)}
                    />
                    {connectionStringError && (
                        <div className="text-sm text-red-500">
                            {connectionStringError}
                        </div>
                    )}
                    {errors?.connectionString && (
                        <div className="text-sm text-red-500">
                            {errors.connectionString}
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Format: mysql://username:password@host:port/database?ssl=true
                    </p>
                </div>
                
                {config.connectionString && !connectionStringError && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <h4 className="text-sm font-medium text-green-800">Connection String Valid</h4>
                        <div className="text-xs text-green-700 mt-1">
                            <div>Host: {config.host}</div>
                            <div>Port: {config.port}</div>
                            <div>Database: {config.database}</div>
                            <div>Username: {config.user}</div>
                            <div>SSL: {config.ssl ? "Yes" : "No"}</div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

