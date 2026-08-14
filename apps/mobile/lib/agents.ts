import type { IAgents } from "@packages/utils";
import { getInitializedMobileAgents } from "@/lib/db";

// This file serves as a helper to access the globally initialized agents
// after `initializeMobileAgents()` has been called in the application entry point.

/**
 * Retrieves the singleton instance of initialized agents.
 * Must only be called after the agents have been successfully initialized.
 */
export function getInitializedAgents(): IAgents {
	return getInitializedMobileAgents();
}
