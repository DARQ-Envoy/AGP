"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { instance } from "@/helpers/axios/axiosInstance"
import { getAuthStatus, resetAuthStatus } from "@/helpers/axios/authStatus"
import { toast } from "sonner"

type AuthMode = "signin" | "signup"

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("signin")
  const [authTrigger, setAuthTrigger] = useState(0)
  const isCheckingAuth = useRef(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const handleUnauthenticated = () => setAuthTrigger(n => n + 1)
    window.addEventListener('auth:unauthenticated', handleUnauthenticated)

    const status = getAuthStatus()
    console.log("Auth status on load:", status)
    if (status === 'unauthenticated') {
      toast.error('Your session has expired. Please log in again.')
      resetAuthStatus()
      return () => window.removeEventListener('auth:unauthenticated', handleUnauthenticated)
    }

    if (status === 'authenticated') {
      resetAuthStatus()
      router.replace('/dashboard')
      return () => window.removeEventListener('auth:unauthenticated', handleUnauthenticated)
    }

    if (isCheckingAuth.current) return () => window.removeEventListener('auth:unauthenticated', handleUnauthenticated)

    let cancelled = false

    const checkAuth = async () => {
      isCheckingAuth.current = true
      try {
        await instance.get('/auth/check')
        if (!cancelled) router.replace('/dashboard')
      } catch {
        // interceptor handles redirect
      } finally {
        isCheckingAuth.current = false
      }
    }

    checkAuth()

    return () => {
      cancelled = true
      window.removeEventListener('auth:unauthenticated', handleUnauthenticated)
    }
  }, [authTrigger])

  const switchMode = (next: AuthMode) => {
    setMode(next)
    setErrors({})
    setFormData({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const validateSignup = () => {
    const next: Record<string, string> = {}
    if (!formData.firstName.trim()) next.firstName = "First name is required"
    if (!formData.lastName.trim()) next.lastName = "Last name is required"
    if (!formData.email.trim()) {
      next.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = "Invalid email format"
    }
    if (!formData.password) {
      next.password = "Password is required"
    } else if (formData.password.length < 8) {
      next.password = "Password must be at least 8 characters"
    }
    if (formData.password !== formData.confirmPassword) {
      next.confirmPassword = "Passwords do not match"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)
    try {
      await instance.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      })
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err?.message || 'Invalid email or password!')
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateSignup()) return
    setIsLoading(true)
    try {
      await instance.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        full_name: `${formData.firstName} ${formData.lastName}`,
      })
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-border shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">AGP</span>
              </div>
              <span className="text-xl font-semibold text-card-foreground">Donor Intel</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-card-foreground mb-2">
              {mode === "signin" ? "Donor Intelligence Dashboard" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to access your organization's data"
                : "Get started with your donor intelligence dashboard"}
            </p>
          </div>

          {mode === "signin" ? (
            <form onSubmit={handleSignin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@nonprofit.org"
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={errors.form ? "border-destructive" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => update("password", e.target.value)}
                    className={errors.form ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-primary font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@nonprofit.org"
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => update("password", e.target.value)}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
