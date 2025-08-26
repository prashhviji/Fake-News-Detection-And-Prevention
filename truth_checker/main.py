from fastapi import FastAPI
import asyncio
from fastapi.middleware.cors import CORSMiddleware
api=FastAPI()
# Allow requests from your frontend (VS Code Live Server)
origins = [
    "http://127.0.0.1:5502",  # This is the key line
    "http://localhost:5502",
]

api.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from crew import crew
@api.get('/result/{query}')
async def get_result(query: str):
    result = await asyncio.to_thread(crew.kickoff, inputs={'input': query})
    return {'result': str(result)}
