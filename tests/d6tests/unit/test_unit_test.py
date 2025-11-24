import pytest
from unit_test import getDailyBudgetGoal

class TestFinalPriceCalculator:
    def test_Default(self):
        state = {}
        result = getDailyBudgetGoal(state)
        assert result == 5.00
    
    def test_CurrentBudget(self):
        state = {"daily_budget": 35.00}
        result = getDailyBudgetGoal(state)
        assert result == 35.00
        
    def test_Invalid(self):
        state = {"daily_budget": "N/A"}
        result = getDailyBudgetGoal(state)
        assert result == 5.00