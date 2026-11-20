# APERTURE Quant Engine — Research Stack (proposal)

Status: **research specification only**. No model is trained, no trading engine is deployed, and no order is authorized by this document.

## Platform architecture

| Component | Role | Integration gate |
|---|---|---|
| GitHub | Version-controlled source, CI, review | Tests and approval before merge |
| NautilusTrader | Candidate event-driven Python/Rust backtester | Validate data adapters and reproducibility |
| QuantConnect LEAN | Independent reference backtester | Verify supported data, licensing, brokerage constraints |
| Render | Potential persistent research service | Deploy only after secrets, budgets and health checks |
| Supabase | Experiment metadata, evidence and decision ledger | RLS, retention, access controls |
| Vercel / APERTURE site | Read-only experiment dashboard | No browser-side broker credentials |
| Robinhood / IBKR | Broker data and separately approved execution | Verify granularity, permissions, fees and market hours |

GitHub is the source-code home, **not** the low-latency trading runtime. Do not deploy both NautilusTrader and LEAN as production engines by default: benchmark them first.

## Modern algorithm registry

| ID | Family | Required data | Proposed benchmark | Status |
|---|---|---|---|---|
| BASE-MOM | Short-horizon momentum | 15s/30s OHLCV | Net expectancy after spread/slippage | Research only |
| BASE-VOL | Volume-confirmed breakout | OHLCV | Compare to BASE-MOM | Research only |
| BASE-VWAP | VWAP reclaim | OHLCV | Rolling vs session VWAP | Research only |
| BASE-RISK | Volatility-based exits and sizing | OHLCV | Realistic stop fills | Research only |
| OFI | Order-flow imbalance / multi-level OFI | Timestamped L2 depth and trades | Linear baseline | Data unavailable/unverified |
| MICROPRICE | Queue imbalance / microprice | Best bid/ask and sizes | Next-midprice forecast and net P&L | Data unavailable/unverified |
| DEEPLOB | CNN/LSTM order-book classifier | Historical L2 snapshots | Purged walk-forward vs OFI | Data unavailable/unverified |
| DEEP-OF | Deep order-flow model | Order events or reconstructed OFI | Net P&L vs linear OFI | Data unavailable/unverified |
| TLOB | Transformer Limit Order Book | Deep timestamped LOB history | Same splits/costs vs DeepLOB | Data unavailable/unverified |
| LOBENCH | Representation-learning benchmark | Compatible LOB datasets | Generalization and transfer evaluation | Research reference, not strategy |
| HAWKES | Self-exciting trade/quote events | Timestamped trades/quotes | Event-intensity baseline | Data unavailable/unverified |
| RL-PPO | Reinforcement-learning policy | Validated event-driven simulator | Compare to rule-based execution | Block until simulator validated |
| RL-SAC | Continuous-action RL policy | Validated event-driven simulator | Risk-adjusted execution costs | Block until simulator validated |
| EXEC-AC | Almgren–Chriss execution | Impact/volatility estimates | Cost vs TWAP/VWAP | Research only |
| MM-AS | Avellaneda–Stoikov market making | L2, fills, inventory | Inventory-adjusted net return | Not suitable for initial tiny-capital directional strategy |

## Experiment protocol

1. Freeze symbol universe, dates, labels, cost assumptions and hyperparameters **before** holdout.
2. Validate timestamp ordering, corporate actions, trading halts, missing bars, interpolated bars and survivorship bias.
3. Start with simple baselines. Advanced model must beat the baseline **after all costs** on unseen days.
4. Simulate bid/ask execution, spread, latency, slippage, partial fills, rejected orders, fees and liquidity.
5. Model one synchronized cash account: settled/unsettled funds, buying power, non-overlapping positions, day-trading restrictions and cumulative drawdown.
6. For each candidate report sample size, coverage, gross/net expectancy, median P&L, drawdown, turnover, calibration and sensitivity.
7. For the current small-account research constraint: approximately $38 capital and no more than $2 **intended** loss per trade inclusive of costs. Stops do not guarantee actual loss caps.
8. Reject strategies with insufficient data, negative out-of-sample net expectancy, excessive slippage, or unverifiable broker permissions.
9. Broker execution requires fresh quotes, exact order preview and **separate explicit human approval for each order**. Never place orders from this research pipeline.

## Implementation order

- Phase 1: deterministic Python experiment runner, fixtures, tests and a signed result manifest.
- Phase 2: import historical OHLCV and run baseline algorithms with a portfolio-level ledger.
- Phase 3: benchmark NautilusTrader vs LEAN on identical data.
- Phase 4: source licensed historical L2/order-event data; implement OFI and microprice.
- Phase 5: DeepLOB / Deep OF / TLOB research with leakage-resistant walk-forward tests.
- Phase 6: RL execution research only if earlier phases show positive, robust out-of-sample results.
- Phase 7: read-only APERTURE dashboard; deployment and any live trading remain separately gated.

**No performance or profitability claims are made for these models.**
