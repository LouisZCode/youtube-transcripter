from dotenv import load_dotenv
import yaml

from langchain.agents import create_agent

load_dotenv()

def load_prompts():
    """Load all prompts from prompts.yaml file"""
    with open("agents/prompts.yaml", "r", encoding="utf-8") as f:
        prompts = yaml.safe_load(f)
    return prompts

prompts = load_prompts()
translate_prompt = prompts["TRANSLATE_PROMPT"]

translate_agent = create_agent(
    model="openai:gpt-5-mini",
    system_prompt=translate_prompt
)
