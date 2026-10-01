from fastapi import Depends, FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from database import engine, get_db
from models import Base, Task

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

Base.metadata.create_all(bind=engine)


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    completed: bool = False

class TaskUpdate(BaseModel):
    title: str
    description: str | None = None
    completed: bool

@app.get("/")
def home():
    return FileResponse("static/index.html")

@app.get("/tasks")
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return tasks

@app.post("/tasks")
def create_task(task: TaskCreate, db: Session = Depends(get_db)):

    new_task = Task(
        title=task.title,
        description=task.description,
        completed=task.completed
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task

@app.get("/tasks/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db)):

    task = db.query(Task).filter(Task.id == task_id).first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task

@app.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    updated_task: TaskUpdate,
    db: Session = Depends(get_db)
):
    
    task_query = db.query(Task).filter(Task.id == task_id)

    task = task_query.first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task_query.update({
        "title": updated_task.title,
        "description": updated_task.description,
        "completed": updated_task.completed
    })

    db.commit()

    return task_query.first()
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):

    task_query = db.query(Task).filter(Task.id == task_id)

    task = task_query.first()

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task_query.delete()

    db.commit()

    return {
        "message": "Task deleted successfully"
    }