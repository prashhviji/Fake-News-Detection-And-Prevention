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
              precheck_claims_task,    # Step 2: split into claims
            # Step 3: normalize claims
        search_task,       # Step 4: search credible sources
        factcheck_task,     # Step 5: fact-check with sources
       # report_task         # Step 6: compile report
    ],
    process=Process.sequential,
    verbose=True
)

result=crew.kickoff(inputs={'url':'https://www.thehindu.com/news/national/tamil-nadu/burglars-decamp-with-39-sovereigns-of-gold-silver-objects-from-farmers-house-in-ranipet/article69928860.ece'})
print(result)