import { AuthContext } from "@/context/AuthContext";
import { getLoginToken } from "@/serivces/auth/getLoginToken";
import { useGoogleLogin } from "@react-oauth/google";


import { useContext } from "react";
export function GoogleAuthLogin() {

const { setIsAuthenticated } = useContext(AuthContext)!;
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
        const authorizationCode = tokenResponse.code;
        const loginCredentials = await getLoginToken(authorizationCode);
        if (loginCredentials) {
            localStorage.setItem("loginToken", loginCredentials);
            setIsAuthenticated(true);
        } else {
            console.error("Failed to retrieve login token");
        }
    },
    scope: "profile email",
    flow: "auth-code",
  });

  return <button onClick={() => login()}>Login with Google</button>;
}