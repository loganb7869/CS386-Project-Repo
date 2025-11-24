import unittest
from decimal import Decimal

class CalorieTrackerTest(unittest.TestCase):
	def test_trackCals(self):
		track = calorieTracker()
		tracker.addFood(“Apple”, 95)
		tracker.addFood(“Orange”, 45)
		self.assertIn(("Apple", Decimal("95")), track.foodLog)
        self.assertIn(("Orange", Decimal("45")), track.foodLog)
		self.assertEqual(tracker.totalCalories(), 140)

if __name__ == "__main__":
    unittest.main()
