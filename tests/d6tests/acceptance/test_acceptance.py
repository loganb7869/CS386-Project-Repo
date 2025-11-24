import pytest
from unit_test import getDailyBudgetGoal, addCost, getRemainingBudget

class TestAcceptance:
    def test_default_budget_purchase(self):
        state = {}
        budget = getDailyBudgetGoal(state)

        assert budget == 20.00

        unit_cost = 8.50
        quantity = 1
        spent = addCost(unit_cost, quantity)
        
        assert spent == 8.50

        remaining = getRemainingBudget(state, unit_cost, quantity)

        assert remaining == 11.50

    def test_custom_budget_purhcase(self):
        state = {"daily_budget": 50.00}
        budget = getDailyBudgetGoal(state)

        assert budget == 50.00

        unit_cost = 12.99
        quantity = 2
        spent = addCost(unit_cost, quantity)
        
        assert spent == 25.98

        remaining = getRemainingBudget(state, unit_cost, quantity)

        assert remaining == 24.02
