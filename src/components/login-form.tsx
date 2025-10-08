"use client"

import { Dog } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simple validation
    if (!email || !password) {
      toast.error("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (isSignUp && password.length < 6) {
      toast.error("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      if (isSignUp) {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          toast.error(error.message)
          return
        }

        if (data.user) {
          if (data.user.identities?.length === 0) {
            toast.success("Account created! Please check your email to confirm.")
          } else {
            toast.success("Account created successfully!")
            router.push("/dashboard")
            router.refresh()
          }
        }
      } else {
        // Sign in existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          toast.error(error.message)
          return
        }

        if (data.user) {
          toast.success("Login successful!")
          router.push("/dashboard")
          router.refresh()
        }
      }
    } catch (error) {
      console.error("Auth error:", error)
      toast.error(isSignUp ? "Sign up failed. Please try again." : "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Dog className="size-6" />
              </div>
              <span className="sr-only">Asset Dog</span>
            </a>
            <h1 className="text-xl font-bold">
              {isSignUp ? "Create an Account" : "Welcome to Asset Dog"}
            </h1>
            <div className="text-center text-sm text-muted-foreground">
              {isSignUp 
                ? "Sign up to get started with Asset Dog" 
                : "Your comprehensive asset management solution"
              }
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@assetdog.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password {isSignUp && "(minimum 6 characters)"}</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "Create a password" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading 
                ? (isSignUp ? "Creating account..." : "Signing in...") 
                : (isSignUp ? "Sign Up" : "Sign In")
              }
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                </span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setIsSignUp(!isSignUp)
                setEmail("")
                setPassword("")
              }}
              disabled={isLoading}
            >
              {isSignUp ? "Sign In Instead" : "Create Account"}
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground text-center text-xs text-balance">
        <p className="mt-2">
          By {isSignUp ? "signing up" : "signing in"}, you agree to our{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}
