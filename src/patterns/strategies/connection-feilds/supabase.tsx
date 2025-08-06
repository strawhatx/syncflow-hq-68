// Strategy pattern for rendering connection fields

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConnectionFieldsStrategy } from "./index";
import { z } from "zod";
import { sanitizeField } from "@/lib/sanitize";

export class SupabaseFieldsStrategy implements ConnectionFieldsStrategy {
    getDefaults(): Record<string, any> {
        return {
            url: "",
            database: ""
        }
    }
    getSchema(): z.ZodObject<any> {
        return z.object({
            name: z.string().min(1, "Name is required"),
            project_url: z.string().min(1, "Project URL is required"),
            api_key: z.string().min(1, "API Key is required")
        })
    }
    renderFields(config: Record<string, any>, setConfig: (config: Record<string, any>) => void, errors?: Record<string, string>): React.ReactNode {
        return (
            <>
                <div className="space-y-2">
                    <Label htmlFor="project_url">Project URL</Label>
                    <Input
                        id="project_url"
                        type="text"
                        placeholder="https://[project_id].supabase.co"
                        value={config.project_url || ""}
                        onChange={(e) => setConfig({ ...config, project_url: sanitizeField(e.target.value, "projectUrl") })}
                    />
                    {errors?.project_url && (
                        <div className="text-sm text-red-500">
                            {errors.project_url}
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="api_key">API Key</Label>
                    <Input
                        id="api_key"
                        type="password"
                        placeholder="sb_**********************"
                        value={config.api_key || ""}
                        onChange={(e) => setConfig({ ...config, api_key: sanitizeField(e.target.value, "apiKey") })}
                    />
                    {errors?.api_key && (
                        <div className="text-sm text-red-500">
                            {errors.api_key}
                        </div>
                    )}
                </div>
            </>
        );
    }
}
