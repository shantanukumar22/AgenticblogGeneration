from dotenv import load_dotenv
from langchain_groq  import ChatGroq
import os

class GroqLLM:
    def __init__(self):
        load_dotenv()

    def get_llm(self):
        try:
            os.environ["GROQ_API_KEY"]=self.groq_api_key=os.getenv("GROQ_API_KEY")
            llm=ChatGroq(api_key=self.groq_api_key,model="meta-llama/llama-4-scout-17b-16e-instruct")
            return llm
        except Exception as e:
            raise ValueError("Error occured with the exception : {e}")
