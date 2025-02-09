import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../lib/supabase";

interface Transaction {
  id: number;
  user_id: string;
  type: "Swap" | "Bill Payment" | "Received" | "Shopping" | "Food" | "Transfer";
  amount: number;
  currency: string;
  date: string;
  status: "completed" | "pending" | "failed";
  recipient?: string;
  sender?: string;
  from_amount?: { amount: string; currency: string };
  to_amount?: { amount: string; currency: string };
  category: string | null;
  description?: string;
  account_number: number;
}

const transactionIcons = {
  Swap: ArrowsRightLeftIcon,
  "Bill Payment": CreditCardIcon,
  Received: ArrowDownIcon,
  Shopping: ShoppingBagIcon,
  Food: ShoppingBagIcon,
  Transfer: ArrowUpIcon,
};

const transactionColors = {
  Shopping:
    "from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20",
  Food: "from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20",
  Transfer:
    "from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20",
  Swap: "from-violet-500/10 to-purple-500/10 hover:from-violet-500/20 hover:to-purple-500/20",
  "Bill Payment":
    "from-rose-500/10 to-pink-500/10 hover:from-rose-500/20 hover:to-pink-500/20",
  Received:
    "from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20",
};

const statusColors = {
  completed: "bg-emerald-500/10 text-emerald-400",
  pending: "bg-amber-500/10 text-amber-400",
  failed: "bg-red-500/10 text-red-400",
};

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No authenticated user");
      }

      const { data, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Process transactions to fetch recipient names
      if (data) {
        const processedTransactions = await Promise.all(
          data.map(async (transaction) => {
            // Check if recipient is a number (user_id)
            if (transaction.recipient && /^\d+$/.test(transaction.recipient)) {
              const { data: userData, error: userError } = await supabase
                .from("users")
                .select("first_name, last_name")
                .eq("user_id", transaction.recipient)
                .single();

              if (!userError && userData) {
                return {
                  ...transaction,
                  recipient: `${userData.first_name} ${userData.last_name}`,
                };
              }
            }
            return transaction;
          })
        );
        setTransactions(processedTransactions);
      } else {
        setTransactions([]);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch transactions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const categories = Array.from(
    new Set(transactions.map((tx) => tx.category).filter(Boolean))
  );

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery) {
      return true;
    }

    const query = searchQuery.toLowerCase();

    const matchesAccount = tx.account_number
      ?.toString()
      .toLowerCase()
      .includes(query);
    const matchesAmount = tx.amount?.toString().toLowerCase().includes(query);
    const matchesCategory = tx.category?.toLowerCase().includes(query);
    const matchesType = tx.type?.toLowerCase().includes(query);
    const matchesDescription = tx.description?.toLowerCase().includes(query);
    const matchesRecipient = tx.recipient?.toLowerCase().includes(query);

    if (selectedCategory) {
      return (
        (matchesAccount ||
          matchesAmount ||
          matchesCategory ||
          matchesType ||
          matchesDescription ||
          matchesRecipient) &&
        tx.category === selectedCategory
      );
    }

    return (
      matchesAccount ||
      matchesAmount ||
      matchesCategory ||
      matchesType ||
      matchesDescription ||
      matchesRecipient
    );
  });

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Transaction History</h1>
          <p className="text-gray-400">
            View and manage your transaction history
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          className="p-2 hover:bg-secondary-light/50 rounded-lg transition-colors"
        >
          <ArrowPathIcon
            className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions"
            className="w-full bg-secondary/50 border border-secondary-light rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary outline-none"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category ? null : category
                  )
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-secondary/50 text-gray-400 hover:text-white hover:bg-secondary-light/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchQuery || selectedCategory
              ? "No matching transactions found"
              : "No transactions yet"}
          </div>
        ) : (
          filteredTransactions.map((transaction) => {
            const Icon = transactionIcons[transaction.type] || ShoppingBagIcon;

            return (
              <div
                key={transaction.id}
                className={`rounded-xl bg-gradient-to-br border border-secondary-light overflow-hidden hover:border-secondary transition-all ${
                  transactionColors[transaction.type] ||
                  "from-blue-500/10 to-indigo-500/10"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2 mt-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg mb-1">
                          {transaction.type || "Transaction"}
                          {transaction.recipient &&
                            ` • ${transaction.recipient}`}
                        </h3>
                        <div className="text-sm text-gray-400">
                          {transaction.description ||
                            `Account: ${transaction.account_number}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {transaction.from_amount ? (
                        <div className="text-3xl font-bold mt-6">
                          {transaction.from_amount.amount}{" "}
                          {transaction.from_amount.currency} →{" "}
                          {transaction.to_amount?.amount}{" "}
                          {transaction.to_amount?.currency}
                        </div>
                      ) : (
                        <div className="text-3xl font-bold mt-3">
                          {transaction.currency}{" "} $
                          {transaction.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      )}
                      {transaction.status && (
                        <div
                          className={`mt-1 px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 ${
                            statusColors[transaction.status]
                          }`}
                        >
                          <ShieldCheckIcon className="w-4 h-4" />
                          {transaction.status}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div>{new Date(transaction.date).toLocaleDateString()}</div>
                    {transaction.category && (
                      <>
                        <div>•</div>
                        <div>{transaction.category}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
