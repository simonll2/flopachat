import store from "@/store";
import { jwtDecode } from "jwt-decode";

export function getToken() {
  return store.state.auth.token;
}

export function getUserIdFromToken() {
  const token = getToken();
  if (token) {
    const decoded = jwtDecode(token);
    return decoded._id;
  }
  return null;
}
