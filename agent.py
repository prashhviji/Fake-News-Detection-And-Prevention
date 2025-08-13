from crewai import Agent,LLM
from tools import search_tool,factcheck_tool
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

scraper_agent = Agent(
    role='Web Scraper',
    goal='Search the internet for relevant news articles about the given claim {input}',
    verbose=True,
    memory=False,
    backstory=(
        "An internet sleuth who finds every piece of information online "
        "about the news in question."
    ),
    tools=[search_tool],
    allow_delegation=True,
    llm=gllm
)

truth_checker_agent = Agent(
    role='Truth Checker',
    goal='Analyze the collected news and decide if the claim is true, false, or unclear',
    verbose=True,
    memory=False,
    backstory=(
        "A quick-thinking analyst who can review evidence and decide "
        "if the story holds water or is a rumor."
    ),
    tools=factcheck_tool,
    allow_delegation=False,
    llm=gllm
)
 