export async function getLoginToken(authorizationCode: string) {
  try {
    const response = await fetch("http://localhost:8080/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ authorizationCode }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.loginToken;
  } catch (error) {
    console.error("Error fetching login token:", error);
    return null;
  }
}