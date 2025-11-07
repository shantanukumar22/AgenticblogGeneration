from typing import TypedDict
from pydantic import BaseModel,Field
class Blog(BaseModel):
    #so the llm will respond in the proper structure
    title:str=Field(description="title of the blog")
    content:str=Field(description="The main content of the Blog Post")
class BlogState(TypedDict):
    topic:str  #topic is what we will give 
    blog:Blog
    current_language:str

