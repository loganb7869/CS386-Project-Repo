import unittest 

class AllergyTracker(unittest.TestCase):

	def test_AllergyTracker(self):
		tracker = allergyTracker()
		tracker.addAllergy(“soy”)
		self.assertTrue(tracker.hasAllergy(“soy”))
		self.assertFalse(tracker.hasAllergy(“apple”))

if __name__ == "__main__":
    unittest.main()
