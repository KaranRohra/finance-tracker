import { AuthForm } from "../../ui/auth-form";

export default function LoginPage() {
    function handleLoginInput(e: React.ChangeEvent<HTMLInputElement>) {
        // Handle input changes for login
        const {id,value} = e.target;
        console.log(`Input ID: ${id}, Value: ${value}`);
    }
    function handleForgotPassword() {
        // Handle forgot password logic
        console.log("Forgot password clicked");
    }
    function handleGoogleAuth() {
        // Handle Google authentication logic
        console.log("Google authentication clicked");
    }
    function handleLogin() {
        // Handle login button click
        console.log("Login button clicked");
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center  p-6 md:p-10 w-md">
            <div className="w-full max-w-sm md:max-w-3xl">
                <AuthForm
                    title="Login to Finance Tracker Account"
                    handleInput={handleLoginInput}
                    handleButton={handleLogin}
                    handleGoogleAuth={handleGoogleAuth}
                    handleForgotPassword={handleForgotPassword}
                    buttonTitle={"Login"}
                />
            </div>
        </div>
    );
}
