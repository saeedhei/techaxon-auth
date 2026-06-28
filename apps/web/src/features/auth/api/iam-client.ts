const IAM_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchCurrentUser(accessToken: string | null) {
  if (!accessToken) return null;

  try {
    const response = await fetch(`${IAM_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    return data.isAuthenticated ? data.user : null;
  } catch (error) {
    return null;
  }
}
