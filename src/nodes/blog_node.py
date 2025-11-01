from src.llms.groqllm import ChatGroq
from src.states.blogstate import BlogState
class BlogNode:
    """A class to represent  blog node"""
    def __init__(self,llm):
        self.llm=llm
    
    def title_creation(self,state:BlogState):
        """Create the title for the blog"""

        if "topic" in state or state["topic"]:
            prompt="""
                   You are an expert blog content writer use markdown formating. Generate
                   a blog title for the {topic}. This title should be creative and SEO friendly"""

            system_message=prompt.format(topic=state['topic'])
            response=self.llm.invoke(system_message)
            return{"blog":{"title":response.content}}
    def content_generation(self,state:BlogState):
        if "topic" in state and state["topic"]:
            system_prompt= """You are an expert blog content writer. Use Markdown formatting. Generate
                   a blog  for the {topic}. This blog  should be creative and feels like written from professional writers there should be enough spacing  and also u are displaying teh thnking too like here is this and that... there should be nothing like that it should feel like written  from human like."""
            system_message=system_prompt.format(topic=state['topic'])
            response=self.llm.invoke(system_message)
            return {"blog":{"title":state["blog"]["title"],'content':response.content}}







