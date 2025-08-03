import { Connector } from "@/types/connectors";
import { Connection } from "@/types/connectors";

export interface ConnectorWithConnections extends Connector {
  connections: Connection[];
}

// Stub service - TODO: Implement when proper schema is available
export const fetchConnectors = async (): Promise<ConnectorWithConnections[]> => {
  // Mock data for now
  return [
    {
      id: "1",
      icon: "postgresql",
      name: "PostgreSQL",
      description: "Connect to PostgreSQL databases",
      type: "api_key",
      provider: "postgresql",
      client_id: "",
      auth_url: "",
      token_url: "",
      redirect_url: "",
      scopes: [],
      required_fields: ["host", "port", "database", "username", "password"],
      required_parameters: [],
      code_challenge_required: false,
      is_active: true,
      connections: []
    }
  ];
};