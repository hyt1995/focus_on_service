// src/utils/apiClient.ts

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // 스마트폰 로컬 스토리지에서 JWT 토큰 꺼내오기
  const token =
    typeof window !== "undefined"
      ? window.localStorage?.getItem("focus_auth_token")
      : null;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  // 헤더에 토큰 장착 (x-user-name은 이제 쓰지 않음!)
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const apiUrl = endpoint.startsWith("http")
    ? endpoint
    : `${baseUrl}${endpoint}`;
  return fetch(apiUrl, { ...options, headers });
};
