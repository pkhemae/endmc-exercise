from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Debug the router mounting
print("Mounting API router at /api")

# Mount the router directly at /api without additional prefixes
app.include_router(router, prefix="/api")

# Add a debug endpoint to check if the server is running
@app.get("/")
async def root():
    return {"message": "API is running"}