import { vi, describe, it } from "vitest";
import * as connectionService from "@/services/connections/service";
import { Connector } from "@/types/connectors";

// Mock supabase client with full chain
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

// Mock the fetch call to the validate-connection edge function
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ valid: true }),
  } as Response)
);

describe("connectionService", () => {
  it("should create a connection", async () => {
    const user_id = "123";
    const connector: Connector = {
      id: "123",
      icon: "mongodb",
      name: "test",
      description: "Test MongoDB connector",
      type: "api_key",
      provider: "mongodb",
      client_id: "",
      auth_url: "",
      token_url: "",
      redirect_url: "",
      scopes: [],
      required_fields: ["test"],
      required_parameters: [],
      code_challenge_required: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const connectionName = "test";
    const config = { test: "test", url: "mongodb://test:test@test.com:27017/test" };

    await connectionService.createConnection(user_id, connector, config);
  });
});