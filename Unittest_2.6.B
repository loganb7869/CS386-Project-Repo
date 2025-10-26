import unittest 

class test_shopBudget(unittest.TestCase):

	def test_storeSpending(self):
		tracker = budget(100)
		tracker.moneySpent(25)
		self.assertEqual(tracker.balance, 75)
		self.assertEqual(totalSpent(), 25)

if __name__ == "__main__":
    unittest.main()
