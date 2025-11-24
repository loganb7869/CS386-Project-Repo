import unittest 
from decimal import Decimal

class test_shopBudget(unittest.TestCase):

	def test_storeSpending(self):
		tracker = budget(Decimal('100'))
		tracker.moneySpent(Decimal('25'))
		self.assertEqual(tracker.balance, (Decimal('75'))
		self.assertEqual(totalSpent(), (Decimal('25'))

if __name__ == "__main__":
    unittest.main()
