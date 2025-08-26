from crewai_tools import SeleniumScrapingTool,TavilySearchTool
from dotenv import load_dotenv
load_dotenv()
import os
os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")
# Initialize the tool for internet searching capabilities
search_tool=TavilySearchTool()

scraper = SeleniumScrapingTool()
factcheck_tool = [search_tool, scraper]