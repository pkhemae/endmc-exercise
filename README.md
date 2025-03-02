# EndMC Exercise

A web application for managing and voting on suggestions.

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- SQLite (included in Python standard library)

## Project Structure

```
endmc-exercise/
├── backend/         # FastAPI backend
└── frontend/        # Next.js frontend
```

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up your environment variables in `.env`:
```env
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your_secret_key
```

5. Run database migrations:
```bash
alembic upgrade head
```

6. Start the backend server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Features

- User authentication
- Create and manage suggestions
- Vote on suggestions (like/dislike)
- Responsive design
- Dark mode interface

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`