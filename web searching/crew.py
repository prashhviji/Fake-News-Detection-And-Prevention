from crewai import Crew,Process
from agent import full_page_scraper_agent,scraper_agent,truth_checker_agent,page_splitter_agent,fact_normalizer_agent,report_assembler_agent,claim_prioritizer_agent,claim_grouper_agent,precheck_filter_agent
from tasks import scrape_task,search_task,factcheck_task,normalize_task,report_task,page_split_task ,group_claims_task ,prioritize_claims_task,precheck_claims_task

crew=Crew(
    agents=[
        full_page_scraper_agent,
        page_splitter_agent,
        fact_normalizer_agent,
        claim_prioritizer_agent,
        claim_grouper_agent ,
        
        precheck_filter_agent,
        scraper_agent,
        truth_checker_agent,
        
    ],
    tasks=[
        scrape_task,       
        page_split_task, 
                normalize_task, 
        prioritize_claims_task ,
           group_claims_task ,
              precheck_claims_task,    
            
        search_task,       
        factcheck_task,     
       
    ],
    process=Process.sequential,
    verbose=True
)

result=crew.kickoff(inputs={'url':'https://www.thehindu.com/news/national/pm-modi-likely-to-visit-us-for-unga-session-in-september/article69927100.ece'})
print(result)