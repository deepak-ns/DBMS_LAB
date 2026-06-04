export function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("Payload :",payload); 
    return {
        id: payload.id,
      email: payload.sub,
      role: payload.role,
    };
  } catch (e) {
    return null;
  }
}
