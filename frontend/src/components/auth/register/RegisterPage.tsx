import { AuthForm } from "../../ui/auth-form";
export default function RegisterPage() {
    function handleRegisterInput(e: React.ChangeEvent<HTMLInputElement>) {
        // Handle input changes for login
        const {id,value} = e.target;
        console.log(`Input ID: ${id}, Value: ${value}`);
    }
    function handleRegister() {
        // Handle login button click
        console.log("Register button clicked");
    }
    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 w-md">
            <div className="w-full max-w-sm md:max-w-3xl">
                <AuthForm
                    title="Register to Finance Tracker Account"
                    handleInput={handleRegisterInput}
                    handleButton={handleRegister}
                    handleGoogleAuth={() => {}}
                    buttonTitle={"Register"}
                />
            </div>
        </div>
    );
}
