import { useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

interface EmailStepProps {
  onSubmit: (email: string) => void;
  initialEmail: string;
}

export function EmailStep({ onSubmit, initialEmail }: EmailStepProps) {
  const [email, setEmail] = useState(initialEmail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubmit(email);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder=" "
          required
          className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-secondary-light focus:border-primary outline-none peer pt-5 text-white"
        />
        <label className="absolute left-4 top-4 text-gray-400 text-sm transition-all peer-focus:text-xs peer-focus:-translate-y-2.5 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-2.5">
          Email address
        </label>
        <EnvelopeIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-primary hover:bg-primary-dark rounded-lg transition-colors font-medium"
      >
        Continue
      </button>
    </form>
  );
} 