import unittest

class CalorieTrackerTest(unittest.TestCase):
	def test_trackCals(self):
		track = calorieTracker()
		tracker.addFood(“Apple”, 95)
		tracker.addFood(“Orange”, 45)
		self.assertEqual(tracker.totalCalories(), 140)

if __name__ == "__main__":
    unittest.main()
