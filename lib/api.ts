const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Options = RequestInit & { token?: string };

type ApiPayload<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { token, ...init } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const payload = (await response.json()) as ApiPayload<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Request failed");
  }

  return payload.data;
}

export { API_URL };
