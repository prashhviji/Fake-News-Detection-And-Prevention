from crewai_tools import SeleniumScrapingTool,TavilySearchTool,ScrapeWebsiteTool
from crewai import Task,Process,Crew,Agent,LLM
from dotenv import load_dotenv
load_dotenv()
import os
os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")
# Initialize the tool for internet searching capabilities
search_tool=TavilySearchTool()

scraper = SeleniumScrapingTool()
factcheck_tool = [search_tool, scraper]  
page_scraper=ScrapeWebsiteTool()

from dotenv import load_dotenv
load_dotenv()
import os
from langchain_google_genai import ChatGoogleGenerativeAI
gllm=LLM(
    model="gemini/gemini-2.5-flash",
    verbose=True,
    temperature=0.5,
    api_key=os.getenv("GOOGLE_API_KEY")
)


full_page_scraper_agent = Agent(
    role='Full Page Scraper',
    goal=(
        "Given one or more URLs, {url}extract the complete readable text from the pages "
        "while removing irrelevant content such as ads, navigation menus, and scripts. "
        "Preserve paragraph structure and line breaks to maintain context for later fact-checking. "
        "Ensure that special characters, HTML tags, and encoding artifacts are cleaned."
    ),
    verbose=True,
    memory=False,
    backstory=(
        "A meticulous web miner with a knack for cutting through HTML clutter. "
        "They roam the internet’s messy pages, stripping away the noise to reveal "
        "pure, contextual information in its original order. "
        "From news sites to blogs, nothing escapes their systematic sweep — "
        "every fact-bearing sentence is captured and preserved."
    ),
    tools=[page_scraper],  # This should handle fetching + cleaning
    allow_delegation=False,
    llm=gllm
)

page_splitter_agent = Agent(
    role='Page Splitter',
    goal=(
        "Break down long-form text (articles, reports, documents, speeches) into "
        "precisely defined factual units. Each unit should be a single claim or "
        "closely related set of facts, never mixing unrelated information. Maintain "
        "the original sequence and record the source line and paragraph numbers "
        "to preserve full traceability."
    ),
    memory=False,
    backstory=(
        "Lexis Cutter is a forensic text surgeon — surgically dissecting sprawling narratives "
        "into clean, self-contained factual units. She has an uncanny ability to isolate "
        "just the verifiable elements, ignoring fluff, opinions, or rhetorical noise. "
        "Her precision ensures that every downstream analysis has a clean, unambiguous "
        "starting point."
    ),
    tools=[page_scraper],
    verbose=True,
    allow_delegation=True,
    llm=gllm
)

claim_prioritizer_agent = Agent(
    role="Claim Prioritizer",
    goal=(
        "Analyze a list of atomic claims and assign a priority score. "
        "High-priority claims include: numerical/statistical data, recent events, political statements, "
        "and claims that are likely to be impactful or controversial. "
        "Low-priority claims are generic, obvious, or redundant. "
        "Output only the high-priority claims for downstream processing."
    ),
    verbose=True,
    memory=False,
    backstory=(
        "A smart triage officer for information. They know which facts really matter "
        "and filter out the noise, ensuring that the most relevant and urgent claims "
        "move forward for verification."
    ),
    tools=[],  # No external tools needed, lightweight LLM prompt
    allow_delegation=False,
    llm=gllm
)
claim_grouper_agent = Agent(
    role="Claim Grouper",
    goal=(
        "Take a set of high-priority claims and group them into logically related batches. "
        "Each batch should contain claims about the same event, topic, or numeric/statistical dataset. "
        "Maintain the original sequence of claims, and ensure each batch is small enough "
        "to be processed efficiently by the Truth Checker."
    ),
    verbose=True,
    memory=False,
    backstory=(
        "A master organizer of facts. They cluster related pieces of information together, "
        "so verification is faster, more coherent, and reduces redundant checks."
    ),
    tools=[],  # Pure LLM grouping
    allow_delegation=False,
    llm=gllm
)

fact_normalizer_agent = Agent(
    role="Fact Extractor & Normalizer",
    goal=(
        "Take each claim identified by the Page Splitter and rewrite it so it is "
        "clear, specific, and independently fact-checkable. Remove vague language, "
        "resolve pronouns, split multi-fact sentences, and ensure all dates, numbers, "
        "and names are explicit."
    ),
    verbose=True,
    memory=False,
    backstory=(
        "A linguistic forensic specialist. They strip away fluff, replace ambiguity "
        "with clarity, and break complex statements into atomic, checkable truths."
    ),
    tools=[],  # No external tool needed
    allow_delegation=False,
    llm=gllm
)

scraper_agent = Agent(
    role='Web Scraper',
    goal=(
    "Conduct a thorough and targeted search across reputable online sources to gather the most relevant "
    "and up-to-date news articles, reports, and official statements related to the claim:. "
    "Prioritize accuracy, credibility, and recency of information, filtering out duplicates, unrelated content, "
    "and unreliable sources. Provide a clean, organized set of results that can be used for fact-checking."),
    verbose=True,
    memory=False,
    backstory=(
    "Cyra Net, a tireless digital investigator with a knack for uncovering even the most obscure pieces "
    "of information buried across the web. She navigates search engines, archives, and news portals with "
    "surgical precision, piecing together every relevant article, report, or snippet tied to the claim at hand. "
    "No paywall, outdated link, or buried PDF escapes her determination. Cyra thrives on speed and accuracy, "
    "delivering a complete, up-to-date dossier of online findings to support deeper analysis."
    ),
    tools=[search_tool],
    allow_delegation=True,
    llm=gllm
)

precheck_filter_agent = Agent(
    role="Pre-Check Filter",
    goal=(
        "For each batch of claims, perform a quick verification using reputable sources "
        "(e.g., BBC, Reuters, AP News, or official statements). "
        "If credible supporting evidence is found, pass the batch to the Truth Checker. "
        "If no credible evidence is found, mark the batch as 'Unclear' and skip Gemini verification."
    ),
    verbose=True,
    memory=False,
    backstory=(
        "A speed-focused fact scout. They check the basics before the heavy-duty LLM kicks in, "
        "saving time, API calls, and avoiding unnecessary rate-limit hits."
    ),
    tools=[search_tool],  # Use your existing search tool for fast pre-check
    allow_delegation=True,
    llm=gllm
)

truth_checker_agent = Agent(
    role='Truth Checker',
    goal='Perform uncompromising, multi-angle fact verification on any claim by dissecting it into discrete facts (numbers, dates, names, locations, and cause-effect links). Cross-check each fact against at least two independent, reputable, and up-to-date sources before making a judgment. Verify numerical consistency and timeline accuracy to the exact value — no approximations or assumptions. Clearly flag partially correct claims with corrections and explain any contradictions or missing data. Only declare a claim True when *every single detail* matches precisely across multiple sources. Mark as Partially True, False, or Unclear if there is any inconsistency, uncertainty, or lack of corroboration.',
    memory=False,
backstory=(
"Aria Veritas is the ultimate truth forensic — part investigative journalist, part data scientist, part human lie detector. "
"With an encyclopedic recall for facts, she dissects every claim into atomic elements, relentlessly cross-referencing them "
"against the world's most reputable sources. Aria has no patience for vague wording, rounded numbers, or 'close enough' answers. "
"Her creed: precision over perception, facts over feelings. Whether exposing exaggerated headlines, catching hidden numerical errors, "
"or untangling political spin, she operates like a courtroom examiner — methodical, exacting, and impossible to fool. "
"Her verdicts are not just labels; they’re evidence-backed mini-investigations that withstand the harshest scrutiny."
),
    tools=factcheck_tool,
    allow_delegation=False,
    llm=gllm
)

report_assembler_agent = Agent(
    role="Report Assembler",
    goal=(
        "Take the verdicts and corrections from the Truth Checker Agent and compile them "
        "into a structured, reader-friendly report. Include: "
        "- Original claim with position reference (line/para) "
        "- Verdict (True/False/Partially True/Unclear) "
        "- Corrected fact "
        "- Sources "
        "Format as a redline comparison where false or modified parts are highlighted."
    ),
    verbose=True,
    memory=False,
    backstory=(
        "A presentation perfectionist. This agent ensures the final report is clean, "
        "well-structured, and visually makes discrepancies pop out."
    ),
    tools=[],  # Pure LLM formatting
    allow_delegation=False,
    llm=gllm
)

 

#TASKS

scrape_task = Task(
    description=(
        "INPUT: A single valid URL.\n"
        "TASK: Use the Full Page Scraper Agent to fetch the page HTML, extract only the main readable article "
        "content, and strip out ads, menus, navigation bars, scripts, footers, and unrelated elements. "
        "Preserve **original paragraph numbers** and **line breaks** for traceability.\n"
        "The final text must be clean, plain text only, without HTML tags, "
        "and in the same paragraph order as on the source page."
    ),
    agent=full_page_scraper_agent,
    expected_output=(
        "Output a dictionary with:\n"
        "- 'url': The scraped page URL\n"
        "- 'content': A plain-text string containing only the cleaned main article text, "
        "with paragraph numbers and line breaks preserved.\n\n"
        "Example:\n"
        "{ 'url': 'https://example.com/article', 'content': '1. First paragraph...\\n2. Second paragraph...' }"
    )
)
page_split_task = Task(
    description=(
        "INPUT: The cleaned article text from scrape_task.\n"
        "TASK: Break the text into discrete factual claims. "
        "A claim is defined as a single verifiable statement (or a tightly bound set of facts). "
        "Each claim must:\n"
        " - Have a unique Claim ID (e.g., C1, C2, ...)\n"
        " - Include the original paragraph and line numbers from the scraped text for traceability.\n"
        "Avoid combining unrelated facts into one claim."
    ),
    agent=page_splitter_agent,
    expected_output=(
        "Output a list of dictionaries, each with:\n"
        "{ 'id': 'C1', 'text': 'The claim text...', 'source_paragraph': 3, 'source_line': 12 }\n"
        "Example:\n"
        "[ { 'id': 'C1', 'text': 'The Eiffel Tower is located in Paris, France.', "
        "'source_paragraph': 1, 'source_line': 2 }, ... ]"
    ),
    context=[scrape_task]
)

normalize_task = Task(
    description=(
        "INPUT: List of claim objects from page_split_task.\n"
        "TASK: For each claim, rewrite it so it is:\n"
        " - Fully self-contained (resolve all pronouns)\n"
        " - Explicit in dates, numbers, and entities\n"
        " - Split into atomic units (1 fact per claim)\n"
        "Maintain the Claim ID and source paragraph/line for traceability."
    ),
    agent=fact_normalizer_agent,
    expected_output=(
        "Output a list of dictionaries, each with:\n"
        "{ 'id': 'C1', 'normalized_text': 'Normalized claim...', "
        "'source_paragraph': 1, 'source_line': 2 }\n"
        "Example:\n"
        "[ { 'id': 'C1', 'normalized_text': 'The Eiffel Tower, located in Paris, France, was constructed in 1889.', "
        "'source_paragraph': 1, 'source_line': 2 }, ... ]"
    ),
    context=[page_split_task]
)

prioritize_claims_task = Task(
    description=(
        "INPUT: List of atomic claims from page_split_task.\n"
        "TASK: Analyze each claim and assign a priority. "
        "High-priority claims include numerical/statistical data, recent events, political statements, "
        "or any claim likely to impact public perception. "
        "Low-priority claims are generic, obvious, redundant, or irrelevant. "
        "Output only the high-priority claims for downstream processing."
    ),
    agent=claim_prioritizer_agent,
    expected_output=(
        "Output a list of claim objects (same format as page_split_task) "
        "filtered to only high-priority claims.\n"
        "Example:\n"
        "[ { 'id': 'C2', 'text': 'The GDP of France grew 3.4% in 2023.', "
        "'source_paragraph': 2, 'source_line': 7 }, ... ]"
    ),
    context=[normalize_task ]
)
group_claims_task = Task(
    description=(
        "INPUT: List of high-priority claims from prioritize_claims_task.\n"
        "TASK: Group related claims into small batches for efficient fact-checking. "
        "Each batch should contain claims about the same event, topic, or dataset. "
        "Maintain claim order and ensure batch sizes are manageable for the Truth Checker."
    ),
    agent=claim_grouper_agent,
    expected_output=(
        "Output a list of batches, each batch containing 2–5 related claim objects.\n"
        "Example:\n"
        "[ [ { 'id': 'C2', 'text': 'Claim text 1', ... }, { 'id': 'C3', 'text': 'Claim text 2', ... } ], ... ]"
    ),
    context=[prioritize_claims_task]
)

precheck_claims_task = Task(
    description=(
        "INPUT: List of claim batches from group_claims_task.\n"
        "TASK: For each batch, perform a quick web search using reputable sources "
        "(BBC, Reuters, AP, official reports). "
        "If supporting evidence is found, pass the batch to the Truth Checker. "
        "If no credible evidence is found, mark the batch as 'Unclear' and skip Gemini verification."
    ),
    agent=precheck_filter_agent,
    expected_output=(
        "Output a list of verified batches ready for the Truth Checker. "
        "Each batch includes claim objects and a status field:\n"
        "- 'verified' if credible evidence found\n"
        "- 'unclear' if no evidence found\n"
        "Example:\n"
        "[ { 'batch_id': 'B1', 'status': 'verified', 'claims': [ ... ] }, "
        "{ 'batch_id': 'B2', 'status': 'unclear', 'claims': [ ... ] } ]"
    ),
    context=[group_claims_task]
)

search_task = Task(
    description=(
        "INPUT: List of normalized claim objects from normalize_task.\n"
        "TASK: excluding the original source URL (claim['source_url']). Validate claims without using original source URL For each claim, search the web using reputable sources "
        "(government websites, scientific publications, respected news outlets, official data portals). "
        "Collect 2-3 relevant and credible sources per claim with exact excerpts matching or contradicting the claim."
    ),
    expected_output=(
        " Output claims verdicts with external sources and a  list of dictionaries, each with:\n"
        "{ 'id': 'C1', 'sources': [ { 'url': '...', 'excerpt': '...' }, ... ] }\n"
        "Ensure all excerpts are directly relevant to the claim."
    ),
    tools=[search_tool],  # SerperDevTool or DuckDuckGoSearchTool
    agent=scraper_agent,
    context=[precheck_claims_task ] 
)


factcheck_task = Task(
    description=(
        "INPUT: Each normalized claim and its gathered evidence from search_task.\n"
        "TASK: Compare claim text against evidence. "
        "Mark as 'True' only if ALL details match across multiple reputable sources. "
        "If partially correct, mark as 'Partially True' and specify which part is wrong. "
        "If incorrect, mark as 'False' and provide the corrected fact. "
        "If unclear due to lack of evidence, mark as 'Unclear'."
    ),
expected_output = (
    "Output a list of dictionaries:\n"
    "[\n"
    "  { 'id': 'C1', 'claim': 'Original claim text', "
    "'verdict': 'True/False/Partially True/Unclear', "
    "'corrected_fact': 'Corrected fact text', "
    "'sources': [ { 'url': 'https://example.com', 'excerpt': 'Excerpt from the source.' } ] },\n"
    "  { 'id': 'C2', 'claim': 'Another claim text', "
    "'verdict': 'True/False/Partially True/Unclear', "
    "'corrected_fact': 'Corrected fact text', "
    "'sources': [ { 'url': 'https://example2.com', 'excerpt': 'Another excerpt.' } ] }\n"
    "]"
)
,
    tools=factcheck_tool,  # [SerperDevTool(), ScrapeWebsiteTool()]
    agent=truth_checker_agent,
    context=[search_task]
)

report_task = Task(
    description=(
        "INPUT: Claims with verdicts and corrections from factcheck_task.\n"
        "TASK: Compile into a human-readable, redline-style fact-check report. "
        "Include:\n"
        " - Claim ID\n"
        " - Original Claim\n"
        " - Verdict\n"
        " - Corrected Fact (if applicable)\n"
        " - Sources\n"
        "Highlight differences between original and corrected text."
    ),
    agent=report_assembler_agent,
    expected_output=(
        "A formatted text or HTML report where corrections are highlighted in red/green, "
        "ready for review.\n"
        "Example:\n"
        "[C1] Original: 'X is Y.'\nVerdict: False\nCorrected: 'X is Z.'\nSources: ...\n"
    ),
    context=[factcheck_task]
)

#Crew
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
        #report_assembler_agent
    ],
    tasks=[
        scrape_task,       # Step 1: scrape content
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

result=crew.kickoff(inputs={'url':'https://www.timesnownews.com/world/beijing-hits-europe-where-it-hurts-2-eu-banks-banned-in-sanctions-showdown-article-152461962'})
print(result)