from crewai import Crew,Process
from tools import search_tool,factcheck_tool
from agent import scraper_agent,truth_checker_agent
from tasks import scraper_task,factcheck_task

crew=Crew(
    agents=[scraper_agent,truth_checker_agent],
    tasks=[scraper_task,factcheck_task],
    process=Process.sequential,
    verbose=True
)

result=crew.kickoff(inputs={'input':'Trump increased tariff by 40% on india'})
print(result)