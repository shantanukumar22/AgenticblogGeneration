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
                   You are an expert blog content writer. Use Markdown formatting. Generate
                   a blog title for the {topic}. This title should be creative and SEO friendly"""

            system_message=prompt.format(topic=state['topic'])
            response=self.llm.invoke(system_message)
            return{"blog":{"title":response.content}}
    def content_generation(self,state:BlogState):
        if "topic" in state and state["topic"]:
            system_prompt= """you are an expert Blog writer. use markdown formatting. generate a detailed blog content  with detailed breakdown for the topic"""
            system_message=system_prompt.format(topic=state['topic'])
            response=self.llm.invoke(system_message)
            return {"blog":{"title":state["blog"]["title"],'content':response.content}}







