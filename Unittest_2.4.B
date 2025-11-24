import unittest 

class healthChanges(unittest.TestCase):
	
	def test_addHealthChanges(self):
		change = healthChangeTracker()
		change.addChange(“New change 1”)
		change.addChange(“New change 2”)
		self.assertIn(“New Change 1”, change.allChanges())
		self.assertIn(“New Change 2”, change.allChanges())
 		change.updateWeight(180)
        change.updateWeight(178)
		self.assertEqual(change.weightTrend, [180, 178])

if __name__ == "__main__":
    unittest.main()
