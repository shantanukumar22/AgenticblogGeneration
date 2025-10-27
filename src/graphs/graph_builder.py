from langgraph.graph import START,END,StateGraph
from src.states.blogstate import BlogState
from src.llms.groqllm import GroqLLM
class GraphBuilder:
    def __init__(self,llm):
        self.llm=llm
        self.graph=StateGraph(BlogState)
        #state is actually the input which will pass through the nodes so we are just providing it in the format we are expecting the input and output from the llm
        #By storing it as self.llm, you make it a permanent part of the object’s state.using self is like saving it so u can use it anywhere else wheneber you wat
    def build_topic_graph(self):
        """Build a graph to generate blogs based on the topics"""

        ## addition of the nodes
        self.graph.add_node("title_creation","")
        self.graph.add_node("content_generation",)
        ## adding edges to the node
        self.graph.add_edge(START,"title_creation")
        self.graph.add_edge('title_creation',"content_generation")
        self.graph.add_edge("content_generation",END)

        return self.graph







