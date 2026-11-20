import unittest
from competition import compete,Config
from backtest import Quote

class CompetitionTests(unittest.TestCase):
    def quotes(self):
        data=[]
        for i in range(40):
            for symbol in ("AAA","BBB"):
                bid=1+.003*i+(0 if symbol=="AAA" else .1)
                data.append(Quote(float(i*5),symbol,bid,bid+.002,200,100))
        return data
    def test_deterministic(self):
        a=compete(self.quotes())
        self.assertEqual(a,compete(list(reversed(self.quotes()))))
        self.assertEqual(set(a),{"momentum","microprice","ofi","regime","combined"})
        self.assertTrue(all(x["research_only"] for x in a.values()))
    def test_duplicate_rejected(self):
        q=self.quotes()
        with self.assertRaises(ValueError):compete(q+[q[0]])
    def test_empty_rejected(self):
        with self.assertRaises(ValueError):compete([])
    def test_slippage_hurts(self):
        a=compete(self.quotes(),Config(slip_bps=0))
        b=compete(self.quotes(),Config(slip_bps=50))
        self.assertLessEqual(b["momentum"]["net_pnl_marked"],a["momentum"]["net_pnl_marked"])
    def test_spread_gate(self):
        q=[Quote(x.timestamp,x.symbol,x.bid,x.bid+.05,x.bid_size,x.ask_size) for x in self.quotes()]
        self.assertTrue(all(x["events"]==0 for x in compete(q).values()))
if __name__=="__main__":unittest.main()
