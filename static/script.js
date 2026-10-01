const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");


// ==================================================
// GET ALL TASKS
// ==================================================

async function loadTasks() {

    try {

        const response = await fetch("/tasks");

        if (!response.ok) {
            console.error("Failed to load tasks");
            return;
        }

        const tasks = await response.json();

        taskList.innerHTML = "";

        tasks.forEach(task => {

            const taskCard = document.createElement("div");

            // IMPORTANT:
            // Give every task card a unique ID
            taskCard.className = "task-card";
            taskCard.id = `task-${task.id}`;


            taskCard.innerHTML = `

                <h3 class="${task.completed ? "completed" : ""}">
                    ${task.title}
                </h3>

                <p>
                    ${task.description || "No description"}
                </p>

                <p>
                    Status:
                    ${task.completed ? "Completed ✅" : "Pending ⏳"}
                </p>

                <div class="task-actions">

                    <button
                        class="edit-btn"
                        onclick="editTask(${task.id})">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteTask(${task.id})">
                        Delete
                    </button>

                </div>
            `;


            taskList.appendChild(taskCard);

        });

    } catch (error) {

        console.error("Error loading tasks:", error);

    }
}



// ==================================================
// CREATE TASK
// ==================================================

taskForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    const title =
        document.getElementById("title").value;

    const description =
        document.getElementById("description").value;


    const newTask = {

        title: title,

        description: description,

        completed: false

    };


    try {

        const response = await fetch("/tasks", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(newTask)

        });


        if (!response.ok) {

            const error = await response.json();

            console.error(error);

            alert("Failed to create task");

            return;

        }


        const createdTask = await response.json();

        console.log("Created task:", createdTask);


        // Clear form
        taskForm.reset();


        // Reload tasks from PostgreSQL
        await loadTasks();

    }

    catch (error) {

        console.error("Error creating task:", error);

    }

});



// ==================================================
// DELETE TASK
// ==================================================

async function deleteTask(taskId) {

    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `/tasks/${taskId}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            alert("Failed to delete task");

            return;

        }


        // Reload tasks
        await loadTasks();

    }

    catch (error) {

        console.error(
            "Error deleting task:",
            error
        );

    }

}



// ==================================================
// EDIT TASK
// ==================================================

async function editTask(taskId) {

    try {

        // First get the task from FastAPI
        const response = await fetch(
            `/tasks/${taskId}`
        );


        if (!response.ok) {

            alert("Task not found");

            return;

        }


        const task = await response.json();


        // Find the task card
        const taskCard =
            document.getElementById(
                `task-${taskId}`
            );


        if (!taskCard) {

            console.error(
                "Task card not found"
            );

            return;

        }


        // Replace task card with edit form
        taskCard.innerHTML = `

            <div class="edit-form">

                <h3>
                    Edit Task
                </h3>


                <label>
                    Title
                </label>

                <input
                    type="text"
                    id="edit-title-${taskId}"
                    value="${task.title}"
                >


                <label>
                    Description
                </label>

                <textarea
                    id="edit-description-${taskId}"
                >${task.description || ""}</textarea>


                <label class="checkbox-label">

                    <input
                        type="checkbox"
                        id="edit-completed-${taskId}"
                        ${task.completed ? "checked" : ""}
                    >

                    Completed

                </label>


                <div class="task-actions">

                    <button
                        onclick="saveTask(${taskId})">
                        Save Changes
                    </button>


                    <button
                        class="edit-btn"
                        onclick="loadTasks()">
                        Cancel
                    </button>

                </div>

            </div>

        `;

    }

    catch (error) {

        console.error(
            "Error editing task:",
            error
        );

    }

}



// ==================================================
// SAVE UPDATED TASK
// ==================================================

async function saveTask(taskId) {

    const title =
        document.getElementById(
            `edit-title-${taskId}`
        ).value;


    const description =
        document.getElementById(
            `edit-description-${taskId}`
        ).value;


    const completed =
        document.getElementById(
            `edit-completed-${taskId}`
        ).checked;


    const updatedTask = {

        title: title,

        description: description,

        completed: completed

    };


    try {

        const response = await fetch(
            `/tasks/${taskId}`,
            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify(
                    updatedTask
                )

            }
        );


        if (!response.ok) {

            const error =
                await response.json();

            console.error(error);

            alert(
                "Failed to update task"
            );

            return;

        }


        // Reload from PostgreSQL
        await loadTasks();

    }

    catch (error) {

        console.error(
            "Error updating task:",
            error
        );

    }

}



// ==================================================
// REFRESH BUTTON
// ==================================================

const refreshButton =
    document.getElementById(
        "refreshButton"
    );


if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        function() {

            loadTasks();

        }
    );

}



// ==================================================
// INITIAL LOAD
// ==================================================

loadTasks();