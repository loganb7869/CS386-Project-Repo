def getDailyBudgetGoal(state):
    if "daily_budget" not in state or state["daily_budget"] in (None, "", "N/A"):
        state["daily_budget"] = 20.00
        return 20.00
    else:
        return float(state["daily_budget"])
    
def addCost(unit_cost, quantity):
    return unit_cost * quantity
    
def getRemainingBudget(state, unit_cost, quantity):
    spent = addCost(unit_cost, quantity)
    budget = getDailyBudgetGoal(state)
    return budget - spent