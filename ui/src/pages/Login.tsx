import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GoogleIcon,
  TelegramIcon,
  AppleIcon,
} from "../components/icons/SocialIcons";
import { PasswordStep } from "../components/login/PasswordStep";
import { supabase } from "../lib/supabase";

function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "password">("email");
  const navigate = useNavigate();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setStep("password");
    }
  };

  const handleLogin = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("An error occurred during login");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-overlay animate-float"
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              background: `radial-gradient(circle, rgba(0,82,255,0.1) 0%, rgba(0,82,255,0) 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-secondary-light relative">
        <Link to="/" className="block text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <span className="font-display text-2xl font-bold text-primary">
              Radio
            </span>
          </div>
        </Link>

        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-gray-400 mb-8">Log in to access your account</p>

        <div className="space-y-6">
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-secondary-light focus:border-primary outline-none peer pt-5"
                />
                <label className="absolute left-4 top-4 text-gray-400 text-sm transition-all peer-focus:text-xs peer-focus:-translate-y-2.5 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2.5">
                  Email/Phone number
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-6 bg-primary hover:bg-primary-dark rounded-lg transition-colors font-medium"
              >
                Next
              </button>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-light"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-secondary/50 backdrop-blur-sm text-gray-400">
                    or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className="p-3 rounded-lg border border-secondary-light hover:bg-secondary-light/50 transition-all flex items-center justify-center group"
                >
                  <GoogleIcon />
                </button>
                <button
                  type="button"
                  className="p-3 rounded-lg border border-secondary-light hover:bg-secondary-light/50 transition-all flex items-center justify-center group"
                >
                  <AppleIcon />
                </button>
                <button
                  type="button"
                  className="p-3 rounded-lg border border-secondary-light hover:bg-secondary-light/50 transition-all flex items-center justify-center group"
                >
                  <TelegramIcon />
                </button>
              </div>
            </form>
          ) : (
            <PasswordStep
              email={email}
              onBack={() => setStep("email")}
              onSubmit={handleLogin}
              error={error}
            />
          )}

          <div className="text-center mt-8">
            <span className="text-gray-400">Don't have an account? </span>
            <Link
              to="/register"
              className="text-primary hover:text-primary-light transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
