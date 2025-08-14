from crewai import Task
from tools import search_tool,factcheck_tool
from agent import full_page_scraper_agent,scraper_agent,truth_checker_agent,page_splitter_agent,fact_normalizer_agent,report_assembler_agent,precheck_filter_agent,claim_grouper_agent,claim_prioritizer_agent

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