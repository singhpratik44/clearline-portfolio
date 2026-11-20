import unittest
from backtest import Quote,Ledger
class BacktestTests(unittest.TestCase):
    def q(self,t,bid=1,ask=1.01,bidsize=1000,asksize=1000): return Quote(t,"TEST",bid,ask,bidsize,asksize)
    def test_round_trip_drawdown(self):
        l=Ledger(38)
        self.assertEqual(l.buy(self.q(1),20),"FILLED_SIMULATED")
        self.assertAlmostEqual(l.mark({"TEST":self.q(2,.98,.99)}),37.4)
        self.assertAlmostEqual(l.max_drawdown,.6)
        self.assertEqual(l.sell(self.q(3,.98,.99)),"FILLED_SIMULATED")
        self.assertAlmostEqual(l.cash,37.4)
    def test_risk(self): self.assertEqual(Ledger().buy(self.q(1),30,stop_fraction=.1),"RISK_LIMIT")
    def test_cash(self): self.assertEqual(Ledger(10).buy(self.q(1),15),"INSUFFICIENT_CASH")
    def test_depth(self): self.assertEqual(Ledger().buy(self.q(1,asksize=2),3),"INSUFFICIENT_DISPLAYED_ASK_SIZE")
    def test_stale(self):
        l=Ledger();l.buy(self.q(1),1)
        self.assertEqual(l.sell(self.q(1)),"INVALID_OR_STALE_QUOTE")
    def test_stop_slippage(self):
        l=Ledger();l.buy(self.q(1),1)
        self.assertTrue(l.stop_signal(self.q(2,.8,.81)))
        self.assertEqual(l.sell(self.q(3,.8,.81)),"FILLED_SIMULATED")
        self.assertLess(l.cash,38)
if __name__=="__main__": unittest.main()
