import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface AuthFormProps {
    title: string;
    handleInput: () => void;
    handleButton: () => void;
    handleGoogleAuth: () => void;
    handleForgotPassword: () => void;
    buttonTitle: string; // Added buttonTitle property
}
export function AuthForm({
  title,
  handleInput,
  handleButton,
  handleGoogleAuth,
  handleForgotPassword,
  buttonTitle,
  ...props
}: AuthFormProps) {
  return (
    <div className={cn("flex flex-col gap-6")} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                    {title}
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={handleInput}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    onClick={handleForgotPassword}
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full" onClick={handleButton} >
                {buttonTitle}
              </Button>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                
              <Button variant="outline" className="w-full" onClick={handleGoogleAuth}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {buttonTitle} with Google
                </Button>
                
              </div>
              </div>
              <div className="text-center text-sm">
                {
                  buttonTitle === "Login" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <a href="/register" className="underline underline-offset-4">
                        Sign up
                      </a>
                    </>
                  
                  ) : (
                    <>
                      Already have an account?{" "}
                      <a href="/login" className="underline underline-offset-4">
                        Sign in
                      </a>
                    </>
                  )
                }
                
              </div>
            </div>
          </form>
          <div className=" relative hidden md:block w-full">
            
            <img
              src="https://img.theweek.in/content/dam/week/magazine/theweek/business/images/2023/12/9/54-shutterstock.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
