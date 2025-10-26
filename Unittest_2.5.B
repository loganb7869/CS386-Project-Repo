import unittest 

class fitnessFood(unittest.TestCase):

	def test_mealsFromGoals(self):
		tracker = fitnessFoodTracker()
		tracker.addFood(“Protein shake”, “muscle”)
		tracker.addFood(“Steak”, “fat”)
		self.assertIn(“Protein shake”, tracker.foodFromGoals(“muscle”))
		self.assertIn(“Steak”, tracker.foodFromGoals(“fat”))

if __name__ == "__main__":
    unittest.main()
