from app import app
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient

client = TestClient(app)

def handler(request, context):
    """
    Vercel calls this function for each incoming request.
    We forward the request to FastAPI using TestClient.
    """
    path = request.path_params.get("path", "")
    method = request.method.lower()
    data = request.body
    headers = dict(request.headers)

    response = client.request(method, f"/{path}", data=data, headers=headers)
    return JSONResponse(content=response.json(), status_code=response.status_code)