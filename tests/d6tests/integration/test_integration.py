import pytest
from unit_test import getDailyBudgetGoal, addCost, getRemainingBudget

class TestIntegration:
    def test_budget_remaining_default(self):
        state = {}
        unit_cost = 5.00
        quantity = 1
        remaining_money = getRemainingBudget(state, unit_cost, quantity)

        assert remaining_money == 15.00

    def test_updated_budget(self):
        state = {"daily_budget": 100.00}
        unit_cost = 5.00
        quantity = 10
        remaining_money = getRemainingBudget(state, unit_cost, quantity)

        assert remaining_money == 50.00
