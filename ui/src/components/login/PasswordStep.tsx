import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface PasswordStepProps {
  email: string;
  onBack: () => void;
  onSubmit: (password: string) => void;
  error?: string | null;
}

export function PasswordStep({
  email,
  onBack,
  onSubmit,
  error,
}: PasswordStepProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="text-sm text-gray-400 mb-2">Logging in as</div>
        <div className="font-medium">{email}</div>
      </div>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=" "
          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-secondary-light focus:border-primary outline-none peer pt-5"
        />
        <label className="absolute left-4 top-4 text-gray-400 text-sm transition-all peer-focus:text-xs peer-focus:-translate-y-2.5 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2.5">
          Password
        </label>
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          {showPassword ? (
            <EyeSlashIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm text-primary hover:text-primary-light transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-3 rounded-lg border border-secondary-light hover:bg-secondary-light/50 transition-colors flex-1"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-4 py-3 bg-primary hover:bg-primary-dark rounded-lg transition-colors flex-1 font-medium"
        >
          Log in
        </button>
      </div>
    </form>
  );
}
