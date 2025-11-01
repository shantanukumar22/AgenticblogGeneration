import uvicorn # the asgi that actually runs the app like how node js runs express
from fastapi import FastAPI,Request
from fastapi.middleware.cors import CORSMiddleware
from src.graphs.graph_builder import GraphBuilder
from src.llms.groqllm import GroqLLM

import os
from dotenv import load_dotenv
load_dotenv()
app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.environ["LANGSMITH_API_KEY"]=os.getenv("LANGCHAIN_API_KEY")

@app.post("/blogs")
async def create_blogs(request:Request):
    data=await request.json()
    topic=data.get("topic","")
    Groqllm=GroqLLM()
    llm=Groqllm.get_llm()
    graph_builder=GraphBuilder(llm)
    ## setting the graph
    if topic:
        graph=graph_builder.setup_graph(usecase="topic")
        state=graph.invoke({"topic":topic})
    return({"data":state})

if __name__=="__main__":
    uvicorn.run("app:app",host="0.0.0.0",port=8000,reload=True)
