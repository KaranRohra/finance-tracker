import { AuthForm } from "../../ui/auth-form";
export default function RegisterPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
                <AuthForm
                    title="Register to Finance Tracker Account"
                    handleInput={() => {}}
                    handleButton={() => {}}
                    handleGoogleAuth={() => {}}
                    handleForgotPassword={() => {}}
                    buttonTitle={"Register"}
                />
            </div>
        </div>
    );
}
