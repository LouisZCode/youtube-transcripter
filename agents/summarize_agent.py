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
summary_prompt = prompts["SUMMARIZE_PROMPT"]

summary_agent = create_agent(
    model="openai:gpt-5-mini",
    system_prompt=summary_prompt
)



# to test  python -m agents.summarize_agent
"""
message = input("Write your ticker here:\n")

response = summary_agent.invoke(
    {"messages" : {"role" : "user" , "content" : message}}
    )

for i , msg in enumerate(response["messages"]):
    msg.pretty_print()
"""