"""Deterministic, research-only quote-based algorithm competition. No broker orders."""
from collections import defaultdict, deque
from dataclasses import dataclass
from backtest import Quote, Ledger
from engine import Book, SignalEngine, microprice

@dataclass(frozen=True)
class Config:
    initial_cash: float = 38.0
    max_intended_loss: float = 2.0
    stop_fraction: float = .05
    slip_bps: float = 15.0
    fee: float = 0.0
    max_spread_bps: float = 80.0
    hold_seconds: float = 30.0

def features(history, signal):
    if len(history) < 12: return {}
    q=history[-1]
    mid=(q.bid+q.ask)/2
    prior=(history[-5].bid+history[-5].ask)/2
    mp=microprice(Book(q.timestamp,q.bid,q.ask,q.bid_size,q.ask_size))
    return {"momentum":mid/prior-1>.002,
            "microprice":mp>mid+.1*(q.ask-q.bid),
            "ofi":signal["ofi"] is not None and signal["ofi"]>0,
            "regime":signal["regime"]=="TRENDING",
            "combined":signal["eligible"] and mp>mid}

def compete(quotes, config=Config(), strategies=("momentum","microprice","ofi","regime","combined")):
    """Run independent single-account simulations on identical timestamped quotes.

    Only actual bid/ask and displayed size observations qualify as OFI inputs.
    OHLCV-derived synthetic quotes cannot validate OFI or microprice strategies.
    """
    if not quotes: raise ValueError("no quotes")
    if config.initial_cash<=0 or config.max_intended_loss<=0 or config.hold_seconds<=0: raise ValueError("invalid config")
    if not all(isinstance(q,Quote) and q.valid() for q in quotes): raise ValueError("invalid quotes")
    ordered=sorted(quotes,key=lambda q:(q.timestamp,q.symbol))
    keys=[(q.timestamp,q.symbol) for q in ordered]
    if len(set(keys))!=len(keys): raise ValueError("duplicate timestamp and symbol")
    batches=defaultdict(list)
    for q in ordered:batches[q.timestamp].append(q)
    history=defaultdict(lambda:deque(maxlen=64))
    engines=defaultdict(SignalEngine)
    ledgers={s:Ledger(config.initial_cash) for s in strategies}
    entry_times={s:{} for s in strategies}
    outcomes={s:defaultdict(int) for s in strategies}
    latest={}
    for t in sorted(batches):
        signals={}
        for q in batches[t]:
            latest[q.symbol]=q
            history[q.symbol].append(q)
            state=engines[q.symbol].update(Book(t,q.bid,q.ask,q.bid_size,q.ask_size))
            signals[q.symbol]=features(history[q.symbol],state)
        for name,ledger in ledgers.items():
            ledger.mark(latest)
            exited=False
            for sym in list(ledger.positions):
                q=latest[sym]
                if q.timestamp!=t:continue
                if ledger.stop_signal(q) or t-entry_times[name][sym]>=config.hold_seconds:
                    result=ledger.sell(q,fee=config.fee,slip_bps=config.slip_bps)
                    outcomes[name][result]+=1
                    if result=="FILLED_SIMULATED":
                        del entry_times[name][sym]
                        exited=True
            if exited or ledger.positions:continue
            for q in sorted(batches[t],key=lambda x:x.symbol):
                if not signals[q.symbol].get(name):continue
                spread=10000*(q.ask-q.bid)/((q.ask+q.bid)/2)
                if spread>config.max_spread_bps:
                    outcomes[name]["SPREAD_REJECTED"]+=1
                    continue
                fill=q.ask*(1+config.slip_bps/10000)
                per_share_risk=fill*(config.stop_fraction+config.slip_bps/10000)+2*config.fee
                size=min(int(ledger.cash/(fill+config.fee)),int(config.max_intended_loss/per_share_risk),q.ask_size)
                if size<1:
                    outcomes[name]["SIZE_REJECTED"]+=1
                    continue
                result=ledger.buy(q,size,fee=config.fee,slip_bps=config.slip_bps,
                                  stop_fraction=config.stop_fraction,max_intended_loss=config.max_intended_loss)
                outcomes[name][result]+=1
                if result=="FILLED_SIMULATED":
                    entry_times[name][q.symbol]=t
                    break
    result={}
    for name,ledger in ledgers.items():
        equity=ledger.mark(latest)
        result[name]={"cash":round(ledger.cash,4),"marked_equity":round(equity,4),
                      "net_pnl_marked":round(equity-config.initial_cash,4),
                      "max_drawdown":round(ledger.max_drawdown,4),
                      "open_positions":len(ledger.positions),
                      "events":len(ledger.events),"outcomes":dict(outcomes[name]),
                      "research_only":True}
    return result
