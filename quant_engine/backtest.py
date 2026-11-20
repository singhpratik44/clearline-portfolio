"""Research-only single-account quote-driven simulator. Never sends broker orders."""
from dataclasses import dataclass, field
from math import isfinite

@dataclass(frozen=True)
class Quote:
    timestamp: float
    symbol: str
    bid: float
    ask: float
    bid_size: int
    ask_size: int
    def valid(self):
        return bool(self.symbol) and all(isfinite(x) for x in (self.timestamp,self.bid,self.ask)) and 0<self.bid<self.ask and self.bid_size>0 and self.ask_size>0

@dataclass
class Position:
    shares: int
    entry: float
    stop: float

@dataclass
class Ledger:
    initial_cash: float=38.
    cash: float=field(init=False)
    positions: dict=field(default_factory=dict)
    events: list=field(default_factory=list)
    peak_equity: float=field(init=False)
    max_drawdown: float=0.
    last_timestamp: float=float("-inf")
    def __post_init__(self):
        if not isfinite(self.initial_cash) or self.initial_cash<=0: raise ValueError("invalid cash")
        self.cash=self.peak_equity=self.initial_cash
    def mark(self,quotes):
        if any(s not in quotes or not quotes[s].valid() for s in self.positions): raise ValueError("missing quote")
        equity=self.cash+sum(p.shares*quotes[s].bid for s,p in self.positions.items())
        self.peak_equity=max(self.peak_equity,equity)
        self.max_drawdown=max(self.max_drawdown,self.peak_equity-equity)
        return equity
    def buy(self,q,shares,fee=0.,slip_bps=0.,stop_fraction=.05,max_intended_loss=2.):
        if not q.valid() or q.timestamp<=self.last_timestamp: return "INVALID_OR_STALE_QUOTE"
        if type(shares)!=int or shares<=0: return "INVALID_SHARES"
        if any(not isfinite(x) for x in (fee,slip_bps,stop_fraction,max_intended_loss)) or fee<0 or slip_bps<0 or not 0<stop_fraction<1 or max_intended_loss<=0: return "INVALID_PARAMETERS"
        if q.symbol in self.positions: return "POSITION_EXISTS"
        if shares>q.ask_size: return "INSUFFICIENT_DISPLAYED_ASK_SIZE"
        fill=q.ask*(1+slip_bps/10000)
        total=shares*fill+fee
        stop=fill*(1-stop_fraction)
        estimated_loss=shares*(fill-stop+q.ask*slip_bps/10000)+2*fee
        if estimated_loss>max_intended_loss+1e-9: return "RISK_LIMIT"
        if total>self.cash+1e-9: return "INSUFFICIENT_CASH"
        self.cash-=total
        self.positions[q.symbol]=Position(shares,fill,stop)
        self.last_timestamp=q.timestamp
        self.events.append(dict(t=q.timestamp,symbol=q.symbol,action="BUY",shares=shares,fill=fill,fee=fee,cash=self.cash))
        return "FILLED_SIMULATED"
    def sell(self,q,fee=0.,slip_bps=0.):
        if not q.valid() or q.timestamp<=self.last_timestamp: return "INVALID_OR_STALE_QUOTE"
        if q.symbol not in self.positions: return "NO_POSITION"
        if any(not isfinite(x) for x in (fee,slip_bps)) or fee<0 or not 0<=slip_bps<10000: return "INVALID_PARAMETERS"
        p=self.positions[q.symbol]
        if p.shares>q.bid_size: return "INSUFFICIENT_DISPLAYED_BID_SIZE"
        fill=q.bid*(1-slip_bps/10000)
        self.cash+=p.shares*fill-fee
        del self.positions[q.symbol]
        self.last_timestamp=q.timestamp
        self.events.append(dict(t=q.timestamp,symbol=q.symbol,action="SELL",shares=p.shares,fill=fill,fee=fee,cash=self.cash))
        return "FILLED_SIMULATED"
    def stop_signal(self,q):
        p=self.positions.get(q.symbol)
        return bool(p and q.valid() and q.bid<=p.stop)
