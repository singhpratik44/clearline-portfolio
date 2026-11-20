import unittest
from engine import Book,microprice,ofi,RegimeDetector,plan_limit_buy,SignalEngine

class TestQuant(unittest.TestCase):
    def test_microprice(self):
        self.assertAlmostEqual(microprice(Book(1,1,1.02,300,100)),1.015)
    def test_ofi(self):
        self.assertEqual(ofi(Book(1,1,1.02,100,100),Book(2,1.01,1.02,150,80)),170)
    def test_bad_book(self):
        with self.assertRaises(ValueError): microprice(Book(1,1,1,10,10))
    def test_regime_spread(self):
        self.assertEqual(RegimeDetector().update(Book(1,1,1.1,10,10)),"ILLIQUID")
    def test_execution_gate(self):
        self.assertFalse(plan_limit_buy(Book(1,1,1.10,100,100),38,2,.05).approved_for_research)
        p=plan_limit_buy(Book(1,1,1.005,1000,1000),38,2,.05)
        self.assertTrue(p.approved_for_research)
        self.assertLessEqual(p.intended_loss,2)
        self.assertLessEqual(p.estimated_cost,38)
    def test_warmup(self):
        self.assertFalse(SignalEngine().update(Book(1,1,1.001,100,100))["eligible"])

if __name__=="__main__": unittest.main()
