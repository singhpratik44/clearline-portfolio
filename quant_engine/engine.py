"""APERTURE Quant: deterministic, research-only order-book components. No broker actions."""
from dataclasses import dataclass
from collections import deque
from math import isfinite, sqrt

@dataclass(frozen=True)
class Book:
    timestamp: float
    bid: float
    ask: float
    bid_size: float
    ask_size: float
    def valid(self):
        return all(isfinite(v) for v in (self.timestamp,self.bid,self.ask,self.bid_size,self.ask_size)) and self.bid>0 and self.ask>self.bid and self.bid_size>0 and self.ask_size>0

def microprice(book):
    if not book.valid(): raise ValueError("invalid book")
    return (book.ask*book.bid_size+book.bid*book.ask_size)/(book.bid_size+book.ask_size)

def ofi(prev,curr):
    """Best-level order flow imbalance, in displayed shares."""
    if not prev.valid() or not curr.valid() or curr.timestamp<=prev.timestamp: raise ValueError("invalid or nonmonotonic book")
    return ((curr.bid>=prev.bid)*curr.bid_size-(curr.bid<=prev.bid)*prev.bid_size
            -(curr.ask<=prev.ask)*curr.ask_size+(curr.ask>=prev.ask)*prev.ask_size)

class RegimeDetector:
    """Heuristic regime classifier. Thresholds are NOT empirically validated."""
    def __init__(self,max_spread_bps=80,max_volatility=.025,min_samples=12):
        self.max_spread_bps=max_spread_bps
        self.max_volatility=max_volatility
        self.min_samples=min_samples
        self.mids=deque(maxlen=64)
    def update(self,book):
        if not book.valid(): return "INVALID"
        mid=(book.bid+book.ask)/2
        spread=10000*(book.ask-book.bid)/mid
        self.mids.append(mid)
        if spread>self.max_spread_bps: return "ILLIQUID"
        if len(self.mids)<self.min_samples: return "WARMUP"
        returns=[self.mids[i]/self.mids[i-1]-1 for i in range(1,len(self.mids))]
        vol=sqrt(sum(x*x for x in returns)/len(returns))
        if vol>self.max_volatility: return "VOLATILE"
        move=self.mids[-1]/self.mids[0]-1
        return "TRENDING" if abs(move)>max(.008,2*vol) else "RANGING"

@dataclass(frozen=True)
class ExecutionPlan:
    approved_for_research: bool
    shares: int
    limit_price: float|None
    estimated_cost: float
    intended_loss: float
    reason: str

def plan_limit_buy(book,capital,max_loss,stop_fraction,fee=0.,slippage_fraction=.005,max_spread_bps=80):
    """Sizing estimate only; stops cannot guarantee realized loss."""
    if not book.valid() or any(not isfinite(x) for x in (capital,max_loss,stop_fraction,fee,slippage_fraction)):
        return ExecutionPlan(False,0,None,0,0,"INVALID_INPUT")
    if capital<=0 or max_loss<=0 or not 0<stop_fraction<1 or fee<0 or slippage_fraction<0:
        return ExecutionPlan(False,0,None,0,0,"INVALID_INPUT")
    mid=(book.bid+book.ask)/2
    if 10000*(book.ask-book.bid)/mid>max_spread_bps:
        return ExecutionPlan(False,0,None,0,0,"SPREAD_TOO_WIDE")
    price=book.ask*(1+slippage_fraction)
    risk_per_share=price*(stop_fraction+slippage_fraction)+fee
    shares=min(int(capital/(price+fee)),int(max_loss/risk_per_share))
    if shares<1: return ExecutionPlan(False,0,None,0,0,"INSUFFICIENT_CAPITAL_OR_RISK")
    return ExecutionPlan(True,shares,round(price,6),round(shares*(price+fee),4),round(shares*risk_per_share,4),"RESEARCH_ONLY_NOT_EXECUTABLE")

class SignalEngine:
    """Integrates order-flow, microprice and market-regime gating."""
    def __init__(self):
        self.prev=None
        self.regime=RegimeDetector()
    def update(self,book):
        regime=self.regime.update(book)
        imbalance=None
        if self.prev is not None and book.valid() and book.timestamp>self.prev.timestamp:
            imbalance=ofi(self.prev,book)
        if book.valid() and (self.prev is None or book.timestamp>self.prev.timestamp): self.prev=book
        return {"regime":regime,"ofi":imbalance,"microprice":microprice(book) if book.valid() else None,
                "eligible":regime=="TRENDING" and imbalance is not None and imbalance>0}
