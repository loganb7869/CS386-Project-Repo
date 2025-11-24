def getDailyBudgetGoal(state):
    if "daily_budget" not in state or state["daily_budget"] in (None, "", "N/A"):
        state["daily_budget"] = 5.00
        return 5.00
    else:
        return float(state["daily_budget"])