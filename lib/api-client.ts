export type ApiMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type ApiResponse<T> = {
  data: T;
  meta?: ApiMeta;
};

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(status: number, body: ApiErrorBody["error"]) {
    super(body.message);
    this.name = "ApiError";
    this.code = body.code;
    this.status = status;
    this.details = body.details;
  }
}

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  return "http://127.0.0.1:3000";
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers
    },
    credentials: "include",
    cache: init?.cache ?? "no-store"
  });
  const body = (await response.json().catch(() => null)) as ApiResponse<T> | ApiErrorBody | null;

  if (!response.ok || !body || "error" in body) {
    throw new ApiError(
      response.status,
      body && "error" in body
        ? body.error
        : {
            code: "HTTP_ERROR",
            message: `请求失败：${response.status}`,
            details: {}
          }
    );
  }

  return body;
}

export function toQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") {
      searchParams.set(key, String(value));
    }
  });
  const text = searchParams.toString();
  return text ? `?${text}` : "";
}
