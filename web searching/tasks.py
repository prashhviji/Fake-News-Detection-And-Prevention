from crewai import Task
from tools import search_tool,factcheck_tool
from agent import scraper_agent,truth_checker_agent

scraper_task = Task(
    description=(
        "Given a claim, search the internet for recent and credible news articles "
        "related to it. Collect URLs, article snippets, and publication dates."
    ),
    expected_output=(
        "A list of 5–10 relevant articles with their titles, URLs, and short summaries."
    ),
    tools=[search_tool],  # SerperDevTool or DuckDuckGoSearchTool
    agent=scraper_agent
)

factcheck_task = Task(
    description=(
        "Given the claim and the collected articles, search reputable fact-checking "
        "sites (e.g., Snopes, PolitiFact, FactCheck.org) to determine the truthfulness "
        "of the claim. Return a verdict with supporting evidence."
    ),
    expected_output=(
        "Verdict: True, False, or Unclear.\n"
        "Evidence: Summary of why the verdict was reached with source URLs."
    ),
    tools=factcheck_tool,  # [SerperDevTool(), ScrapeWebsiteTool()]
    agent=truth_checker_agent
)
