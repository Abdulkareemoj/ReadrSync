import { createServerFn } from "@tanstack/react-start";

/**
 * Google OAuth token handlers that run only on the server. The client secret
 * is read here inside server-function handlers so it isnt included in
 * the client bundle. Thank you tanstack start
 */

interface GoogleTokenSuccess {
	accessToken: string;
	refreshToken: string | null;
	expiresIn: number;
}

function googleCredentials(): { clientId: string; clientSecret: string } {
	return {
		clientId: import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ?? "",
		clientSecret: import.meta.env.VITE_GOOGLE_WEB_SECRET_ID ?? "",
	};
}

async function tokenRequest(
	body: URLSearchParams,
): Promise<GoogleTokenSuccess> {
	const res = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body,
	});
	const text = await res.text();
	if (!res.ok) {
		throw new Error(`Google token endpoint error (${res.status}): ${text}`);
	}
	const data = JSON.parse(text) as {
		access_token: string;
		refresh_token?: string;
		expires_in: number;
	};
	if (!data.access_token) {
		throw new Error("Google token response missing access_token");
	}
	return {
		accessToken: data.access_token,
		refreshToken: data.refresh_token ?? null,
		expiresIn: data.expires_in ?? 3600,
	};
}

export const exchangeGoogleCode = createServerFn({ method: "POST" })
	.validator(
		(data: { code: string; codeVerifier: string; redirectUri: string }) => data,
	)
	.handler(async ({ data }): Promise<GoogleTokenSuccess> => {
		const { clientId, clientSecret } = googleCredentials();
		const body = new URLSearchParams({
			code: data.code,
			client_id: clientId,
			code_verifier: data.codeVerifier,
			redirect_uri: data.redirectUri,
			grant_type: "authorization_code",
		});
		if (clientSecret) body.append("client_secret", clientSecret);
		return tokenRequest(body);
	});

export const refreshGoogleToken = createServerFn({ method: "POST" })
	.validator((data: { refreshToken: string }) => data)
	.handler(async ({ data }): Promise<GoogleTokenSuccess> => {
		const { clientId, clientSecret } = googleCredentials();
		const body = new URLSearchParams({
			client_id: clientId,
			refresh_token: data.refreshToken,
			grant_type: "refresh_token",
		});
		if (clientSecret) body.append("client_secret", clientSecret);
		return tokenRequest(body);
	});
