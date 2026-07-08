import { TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { PageHeader } from "@/components/PageHeader";
import { TradeForm } from "./TradeForm";
import { TradeRow } from "./TradeRow";

export default async function TradingPage() {
  const userId = await requireUserId();
  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { openedAt: "desc" },
  });

  const closed = trades.filter((t) => t.pnl != null);
  const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0).length;
  const winRate = closed.length ? Math.round((wins / closed.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={TrendingUp} color="green" title="Трейдинг" subtitle="Журнал сделок" />

      <div className="grid grid-cols-3 gap-3">
        <div className="stat-tile">
          <p className="label">Всего сделок</p>
          <p className="text-xl font-bold">{trades.length}</p>
        </div>
        <div className="stat-tile">
          <p className="label">Win rate</p>
          <p className="text-xl font-bold">{winRate}%</p>
        </div>
        <div className="stat-tile">
          <p className="label">Суммарный PnL</p>
          <p className={`text-xl font-bold ${totalPnl >= 0 ? "text-accent-green" : "text-accent-red"}`}>
            {totalPnl >= 0 ? "+" : ""}
            {totalPnl.toFixed(2)}
          </p>
        </div>
      </div>

      <details className="panel group p-5">
        <summary className="cursor-pointer list-none font-semibold text-ink">
          + Новая сделка
        </summary>
        <div className="mt-4">
          <TradeForm />
        </div>
      </details>

      <div className="flex flex-col gap-2">
        {trades.length === 0 && <p className="text-sm text-muted">Журнал пуст.</p>}
        {trades.map((t) => (
          <TradeRow key={t.id} trade={t} />
        ))}
      </div>
    </div>
  );
}
