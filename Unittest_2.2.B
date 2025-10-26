import unittest

class FoodCost(unittest.TestCase):

	def test_foodCost(self):
		track = costTracker()
		tracker.addCost(“Apple”, 1.50)
		tracker.addCost(“Orange”, 5.00)
		self.assertEqual(tracker.totalCost(), 6.50)

if __name__ == "__main__":
    unittest.main()
