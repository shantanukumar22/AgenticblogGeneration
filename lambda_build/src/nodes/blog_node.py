from src.llms.groqllm import ChatGroq
from src.states.blogstate import BlogState
class BlogNode:
    """A class to represent  blog node"""
    def __init__(self,llm):
        self.llm=llm
    
    def title_creation(self, state:BlogState):
        """Create a creative and SEO-friendly blog title"""

        if "topic" in state and state["topic"]:
            prompt = """
            You are an experienced SEO-focused blog writer.
            Write a highly engaging and creative blog title for the topic: "{topic}".
            - The title should capture attention, be concise (under 15 words), and sound natural.
            - Use relevant keywords for SEO optimization.
            - Avoid clickbait; aim for curiosity and clarity.
            - Output only the title in Markdown format (e.g., ### **Title Here**).
            """
            system_message = prompt.format(topic=state["topic"])
            response = self.llm.invoke(system_message)
            return {"blog": {"title": response.content}}
    def content_generation(self, state:BlogState):
        """Generate a well-structured, human-like, SEO-friendly blog"""

        if "topic" in state and state["topic"]:
            system_prompt = """
            You are an expert blog content writer who creates professional, SEO-optimized, and human-like blogs.
            Write a complete blog on the topic "{topic}" using Markdown formatting.

            Requirements:
            - Start with an engaging introduction that hooks the reader.
            - Use clear section headings (## or ###) to structure the content logically.
            - Write naturally, as if a human writer is explaining ideas conversationally.
            - Include transitions between sections that feel smooth and intentional.
            - Add bullet points, bold/italic emphasis, and spacing for readability.
            - Avoid robotic tone, repetition, or overuse of keywords.
            - The blog should read as if written by a passionate professional, blending creativity and information.

            Return the response fully formatted in Markdown.
            """
            system_message = system_prompt.format(topic=state["topic"])
            response = self.llm.invoke(system_message)
            return {"blog": {"title": state["blog"]["title"], "content": response.content}}







