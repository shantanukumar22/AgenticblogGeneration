from app import app
from fastapi.testclient import TestClient
from fastapi.responses import Response

client = TestClient(app)

def handler(request, context):
    method = request.method
    path = request.path_params.get("path", "")
    body = request.body or None
    headers = dict(request.headers or {})

    r = client.request(method, f"/{path}", data=body, headers=headers)
    return Response(
        content=r.content,
        status_code=r.status_code,
        media_type=r.headers.get("content-type", "application/json"),
    )