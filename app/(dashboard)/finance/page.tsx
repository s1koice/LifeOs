import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { TransactionForm } from "./TransactionForm";
import { TransactionRow } from "./TransactionRow";
import { FinanceChart } from "./FinanceChart";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function FinancePage() {
  const userId = await requireUserId();

  const since = new Date();
  since.setMonth(since.getMonth() - 6);
  since.setDate(1);

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const thisMonth = monthKey(now);

  let todayExpense = 0;
  let monthExpense = 0;
  let monthIncome = 0;
  let monthInvestment = 0;

  const monthly: Record<string, { income: number; expense: number; investment: number }> = {};

  for (const tx of transactions) {
    const dKey = new Date(tx.date).toISOString().slice(0, 10);
    const mKey = monthKey(new Date(tx.date));
    monthly[mKey] ??= { income: 0, expense: 0, investment: 0 };

    if (tx.type === "EXPENSE") {
      monthly[mKey].expense += tx.amount;
      if (mKey === thisMonth) monthExpense += tx.amount;
      if (dKey === todayKey) todayExpense += tx.amount;
    } else if (tx.type === "INCOME") {
      monthly[mKey].income += tx.amount;
      if (mKey === thisMonth) monthIncome += tx.amount;
    } else {
      monthly[mKey].investment += tx.amount;
      if (mKey === thisMonth) monthInvestment += tx.amount;
    }
  }

  const chartData = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, ...v }));

  const balance = monthIncome - monthExpense - monthInvestment;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Финансы</h1>
        <p className="text-sm text-muted">Доходы, расходы и инвестиции</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="stat-tile">
          <p className="label">Сегодня</p>
          <p className="text-xl font-bold">-{todayExpense.toFixed(0)}</p>
        </div>
        <div className="stat-tile">
          <p className="label">Расходы / мес</p>
          <p className="text-xl font-bold text-accent-red">-{monthExpense.toFixed(0)}</p>
        </div>
        <div className="stat-tile">
          <p className="label">Доход / мес</p>
          <p className="text-xl font-bold text-accent-green">+{monthIncome.toFixed(0)}</p>
        </div>
        <div className="stat-tile">
          <p className="label">Баланс / мес</p>
          <p className={`text-xl font-bold ${balance >= 0 ? "text-accent-green" : "text-accent-red"}`}>
            {balance >= 0 ? "+" : ""}
            {balance.toFixed(0)}
          </p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="panel p-5">
          <p className="mb-4 font-semibold">Динамика за 6 месяцев</p>
          <FinanceChart data={chartData} />
        </div>
      )}

      <details className="panel group p-5">
        <summary className="cursor-pointer list-none font-semibold text-ink">
          + Новая операция
        </summary>
        <div className="mt-4">
          <TransactionForm />
        </div>
      </details>

      <div className="flex flex-col gap-2">
        {transactions.length === 0 && (
          <p className="text-sm text-muted">Пока нет операций.</p>
        )}
        {transactions.map((tx) => (
          <TransactionRow key={tx.id} tx={tx} />
        ))}
      </div>
    </div>
  );
}
