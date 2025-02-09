import { useState } from "react";
import { UserCircleIcon, PhoneIcon } from "@heroicons/react/24/outline";

interface ProfileStepProps {
  email: string;
  onBack: () => void;
  onSubmit: (profile: { fullName: string; phone: string }) => void;
  loading: boolean;
}

export function ProfileStep({ email, onBack, onSubmit, loading }: ProfileStepProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ fullName, phone });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="text-sm text-gray-400 mb-2">Almost there!</div>
        <div className="font-medium">{email}</div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder=" "
            required
            className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-secondary-light focus:border-primary outline-none peer pt-5 text-white"
          />
          <label className="absolute left-4 top-4 text-gray-400 text-sm transition-all peer-focus:text-xs peer-focus:-translate-y-2.5 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2.5">
            Full Name
          </label>
          <UserCircleIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        <div className="relative">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder=" "
            required
            className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-secondary-light focus:border-primary outline-none peer pt-5 text-white"
          />
          <label className="absolute left-4 top-4 text-gray-400 text-sm transition-all peer-focus:text-xs peer-focus:-translate-y-2.5 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2.5">
            Phone Number
          </label>
          <PhoneIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
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
          disabled={loading}
          className="px-4 py-3 bg-primary hover:bg-primary-dark rounded-lg transition-colors flex-1 font-medium disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Complete Registration"}
        </button>
      </div>
    </form>
  );
} 