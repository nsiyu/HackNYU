import { useState, useEffect } from "react";
import {
  CurrencyDollarIcon,
  PhoneIcon,
  ArrowsRightLeftIcon,
  GlobeAltIcon,
  CreditCardIcon,
  WalletIcon,
  BanknotesIcon as CashIcon,
  MicrophoneIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { MarketTicker } from "./MarketTicker";
import { ReactNode } from "react";
import { supabase } from "../lib/supabase";

interface Wallet {
  type: string;
  balance: string;
  currency: string;
  provider?: string;
  value?: string;
  icon: ReactNode | string;
  change?: number;
  valueUSD: number;
}

interface Account {
  user_id: string;
  fiat: number;
  currency: string;
  mobile_money: number;
  crypto: number;
  created_at: string;
}

interface Transaction {
  id: string;
  type: "Swap" | "Bill Payment" | "Received" | "Shopping" | "Food" | "Transfer";
  amount?: string;
  currency?: string;
  date: string;
  status: "completed" | "pending" | "failed";
  recipient?: string;
  sender?: string;
  from?: { amount: string; currency: string };
  to?: { amount: string; currency: string };
  category?: string;
  description?: string;
  user_id: string;
}

// Add conversion rates (you might want to fetch these from an API in production)
const CONVERSION_RATES = {
  KES_TO_USD: 0.007, // 1 KES = 0.0070 USD
  ETH_TO_USD: 2345.67, // 1 ETH = 2345.67 USD (you should fetch real-time rates)
};

export function Home() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBalanceUSD, setTotalBalanceUSD] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("No authenticated user");
        }

        console.log("Current user:", user.id);

        // Fetch user's accounts and transactions in parallel
        const [accountsResponse, transactionsResponse] = await Promise.all([
          supabase.from("accounts").select("*").eq("user_id", user.id),
          supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .limit(10),
        ]);

        const { data: accounts, error: accountsError } = accountsResponse;
        const { data: transactions, error: transactionsError } =
          transactionsResponse;

        console.log("Fetched accounts:", accounts);
        console.log("Accounts error:", accountsError);
        console.log("Fetched transactions:", transactions);
        console.log("Transactions error:", transactionsError);

        if (accountsError) throw accountsError;
        if (transactionsError) throw transactionsError;

      

        // Set transactions
        setTransactions(transactions || []);

        // Calculate total balance in USD
        const totalUSD = accounts.reduce((total: number, account: Account) => {
          const fiatUSD = account.fiat; // Assuming fiat is already in USD
          const mobileMoneyUSD =
            account.mobile_money * CONVERSION_RATES.KES_TO_USD;
          const cryptoUSD = account.crypto * CONVERSION_RATES.ETH_TO_USD;
          return total + fiatUSD + mobileMoneyUSD + cryptoUSD;
        }, 0);

        setTotalBalanceUSD(totalUSD);

        // Transform the account data into wallets
        const walletsData = accounts
          .map((account: Account) => [
            {
              type: "Fiat",
              balance: account.fiat.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              currency: account.currency || "USD",
              icon: <CashIcon className="w-6 h-6" />,
              valueUSD: account.fiat, // Already in USD
            },
            {
              type: "Mobile Money",
              balance: account.mobile_money.toLocaleString("en-US"),
              currency: "KES",
              provider: "M-Pesa",
              icon: <PhoneIcon className="w-6 h-6" />,
              valueUSD: account.mobile_money * CONVERSION_RATES.KES_TO_USD,
            },
            {
              type: "Crypto",
              balance: account.crypto.toFixed(4),
              currency: "ETH",
              value: (
                account.crypto * CONVERSION_RATES.ETH_TO_USD
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              icon: (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L11.8887 2.37841V15.8561L12 15.9674L18.5774 12.0855L12 2Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 2L5.42261 12.0855L12 15.9674V9.45369V2Z"
                    fill="currentColor"
                    fillOpacity="0.8"
                  />
                  <path
                    d="M12 16.9789L11.9361 17.0566V21.8346L12 22.0001L18.5801 13.0991L12 16.9789Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 22.0001V16.9789L5.42261 13.0991L12 22.0001Z"
                    fill="currentColor"
                    fillOpacity="0.8"
                  />
                  <path
                    d="M12 15.9674L18.5774 12.0855L12 9.45369V15.9674Z"
                    fill="currentColor"
                    fillOpacity="0.5"
                  />
                  <path
                    d="M5.42261 12.0855L12 15.9674V9.45369L5.42261 12.0855Z"
                    fill="currentColor"
                    fillOpacity="0.7"
                  />
                </svg>
              ),
              valueUSD: account.crypto * CONVERSION_RATES.ETH_TO_USD,
              change: 2.5,
            },
          ])
          .flat(); // Flatten the array of arrays into a single array

        setWallets(walletsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const quickActions = [
    {
      icon: ArrowsRightLeftIcon,
      label: "Swap Crypto/Mobile Money",
      gradient: "from-violet-500/20 to-purple-500/20",
      hoverGradient: "hover:from-violet-500/30 hover:to-purple-500/30",
      iconColor: "text-violet-500",
    },
    {
      icon: GlobeAltIcon,
      label: "International Transfer",
      gradient: "from-blue-500/20 to-indigo-500/20",
      hoverGradient: "hover:from-blue-500/30 hover:to-indigo-500/30",
      iconColor: "text-blue-500",
    },
    {
      icon: CreditCardIcon,
      label: "Pay Bills",
      gradient: "from-emerald-500/20 to-teal-500/20",
      hoverGradient: "hover:from-emerald-500/30 hover:to-teal-500/30",
      iconColor: "text-emerald-500",
    },
    {
      icon: WalletIcon,
      label: "Top Up",
      gradient: "from-amber-500/20 to-orange-500/20",
      hoverGradient: "hover:from-amber-500/30 hover:to-orange-500/30",
      iconColor: "text-amber-500",
    },
  ];

  return (
    <div className="h-full w-full">
      {/* Voice Assistant Section */}
      <div className="mb-8 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-primary-light/10 border border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Hey there! 👋</h2>
            <p className="text-gray-300">What can I help you with today?</p>
          </div>
          <button className="p-4 rounded-full bg-primary hover:bg-primary-dark transition-all">
            <MicrophoneIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary-light/30 transition-all text-left">
            "Send money to Nicolas"
          </button>
          <button className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary-light/30 transition-all text-left">
            "Check my balance"
          </button>
          <button className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary-light/30 transition-all text-left">
            "Recent transactions"
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-secondary/30 border border-secondary-light">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Voice Commands Today</div>
              <div className="text-2xl font-bold">24</div>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-xl bg-secondary/30 border border-secondary-light">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Average Response Time</div>
              <div className="text-2xl font-bold">1.2s</div>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-xl bg-secondary/30 border border-secondary-light">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Balance</div>
              <div className="text-2xl font-bold">
                $
                {totalBalanceUSD.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallets Section */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Your Wallets</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            Loading wallets...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.type}
                className="p-6 rounded-xl bg-secondary/30 border border-secondary-light hover:bg-secondary-light/10 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    {wallet.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{wallet.type}</h3>
                    <div className="text-sm text-gray-400">
                      {wallet.provider || wallet.currency}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">
                    {wallet.currency} {wallet.balance}
                  </div>
                  {wallet.value && (
                    <div className="text-sm text-gray-400">
                      ≈ ${wallet.value}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className={`p-6 rounded-xl bg-gradient-to-br border border-secondary-light/50 
                ${action.gradient} ${action.hoverGradient}
                transition-all duration-300 group relative overflow-hidden`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              </div>

              <div className="relative flex flex-col items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center 
                  transform group-hover:scale-110 transition-transform duration-300`}
                >
                  <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                </div>
                <span className="text-sm font-medium text-center group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Section */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Recent Transactions</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-400">
            Loading transactions...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No transactions found
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 rounded-xl bg-secondary/30 border border-secondary-light"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <ArrowsRightLeftIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium">{transaction.type}</div>
                      <div className="text-sm text-gray-400">
                        {transaction.description || transaction.recipient}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {transaction.from ? (
                        <>
                          {transaction.from.amount} {transaction.from.currency}{" "}
                          → {transaction.to?.amount} {transaction.to?.currency}
                        </>
                      ) : (
                        <>
                          {transaction.currency} {transaction.amount}
                        </>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {transaction.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Market Overview */}
      <div className="w-full">
        <MarketTicker />
      </div>
    </div>
  );
}
