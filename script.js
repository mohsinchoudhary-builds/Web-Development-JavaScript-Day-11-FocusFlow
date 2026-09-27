// =====================================================
// FOCUSFLOW
// DAILY LIFE + STUDY PLANNER
// =====================================================


// =====================================================
// STORAGE
// =====================================================

let tasks =
    JSON.parse(
        localStorage.getItem("focusFlowTasks")
    ) || [];


let routines =
    JSON.parse(
        localStorage.getItem("focusFlowRoutines")
    ) || [];


// =====================================================
// ELEMENTS
// =====================================================

const taskContainer =
    document.getElementById("taskContainer");

const searchTask =
    document.getElementById("searchTask");

const taskModal =
    document.getElementById("taskModal");

const routineModal =
    document.getElementById("routineModal");

const taskForm =
    document.getElementById("taskForm");

const routineForm =
    document.getElementById("routineForm");


// =====================================================
// EDIT MODE
// =====================================================

let editingTaskId = null;


// =====================================================
// SAVE DATA
// =====================================================

function saveTasks() {

    localStorage.setItem(
        "focusFlowTasks",
        JSON.stringify(tasks)
    );

}


function saveRoutines() {

    localStorage.setItem(
        "focusFlowRoutines",
        JSON.stringify(routines)
    );

}


// =====================================================
// DATE
// =====================================================

function showDate() {

    const now = new Date();

    const text =
        now.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    document.getElementById(
        "currentDate"
    ).textContent = text;

}


showDate();


// =====================================================
// NAVIGATION
// =====================================================

const navItems =
    document.querySelectorAll(".nav-item");


const sections =
    document.querySelectorAll(".page-section");


navItems.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const target =
                button.dataset.section;


            navItems.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


            button.classList.add(
                "active"
            );


            sections.forEach(section => {

                section.classList.remove(
                    "active-section"
                );

            });


            document
                .getElementById(target)
                .classList.add(
                    "active-section"
                );

        }
    );

});


// =====================================================
// MODALS
// =====================================================

document
    .getElementById("openTaskModal")
    .addEventListener(
        "click",
        () => {

            editingTaskId = null;

            taskForm.reset();


            document.getElementById(
                "taskModalTitle"
            ).textContent =
                "Add New Task";


            taskModal.classList.add(
                "show"
            );

        }
    );


document
    .getElementById("openRoutineModal")
    .addEventListener(
        "click",
        () => {

            routineForm.reset();

            routineModal.classList.add(
                "show"
            );

        }
    );


document
    .querySelectorAll(".close-modal")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const id =
                    button.dataset.close;


                document
                    .getElementById(id)
                    .classList.remove(
                        "show"
                    );

            }
        );

    });


window.addEventListener(
    "click",
    event => {

        if (
            event.target === taskModal
        ) {

            taskModal.classList.remove(
                "show"
            );

        }


        if (
            event.target === routineModal
        ) {

            routineModal.classList.remove(
                "show"
            );

        }

    }
);


// =====================================================
// ADD / UPDATE TASK
// =====================================================

taskForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const name =
            document
                .getElementById("taskName")
                .value
                .trim();


        const description =
            document
                .getElementById(
                    "taskDescription"
                )
                .value
                .trim();


        const start =
            document
                .getElementById("taskStart")
                .value;


        const end =
            document
                .getElementById("taskEnd")
                .value;


        const category =
            document
                .getElementById(
                    "taskCategory"
                )
                .value;


        if (
            !name ||
            !start ||
            !end
        ) {

            alert(
                "Please enter task name, start time and end time."
            );

            return;

        }


        if (
            start === end
        ) {

            alert(
                "Start time and end time cannot be the same."
            );

            return;

        }


        // ================= UPDATE =================

        if (
            editingTaskId !== null
        ) {

            const task =
                tasks.find(
                    item =>
                        item.id ===
                        editingTaskId
                );


            if (task) {

                task.name =
                    name;

                task.description =
                    description ||
                    "No description";

                task.start =
                    start;

                task.end =
                    end;

                task.category =
                    category;

            }


            saveTasks();

            renderTasks();

            updateStats();


            // Agar edited task active timer hai
            if (
                activeTaskId ===
                editingTaskId
            ) {

                timerSeconds =
                    getTaskDuration(
                        task
                    );

                originalTimerSeconds =
                    timerSeconds;

                updateTimerDisplay();

                updateTimerInformation(
                    task
                );

            }


            taskModal.classList.remove(
                "show"
            );


            showToast(
                "Task updated successfully! ✏️"
            );


            editingTaskId = null;

            return;

        }


        // ================= ADD =================

        const newTask = {

            id: Date.now(),

            name: name,

            description:
                description ||
                "No description",

            start: start,

            end: end,

            category: category,

            completed: false

        };


        tasks.push(
            newTask
        );


        saveTasks();

        renderTasks();

        updateStats();


        taskModal.classList.remove(
            "show"
        );


        showToast(
            "Task added successfully! 🎯"
        );

    }
);


// =====================================================
// RENDER TASKS
// =====================================================

function renderTasks() {

    taskContainer.innerHTML = "";


    const search =
        searchTask.value
            .toLowerCase()
            .trim();


    const filteredTasks =
        tasks.filter(task =>

            task.name
                .toLowerCase()
                .includes(search)

        );


    if (
        filteredTasks.length === 0
    ) {

        taskContainer.innerHTML = `

            <div class="empty-state">

                <p>
                    📭 No tasks found.
                </p>

            </div>

        `;

        return;

    }


    filteredTasks.forEach(
        task => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "task";


            if (
                task.completed
            ) {

                element.classList.add(
                    "completed"
                );

            }


            element.innerHTML = `

                <button
                    class="task-check"
                    data-id="${task.id}">
                </button>


                <div class="task-info">

                    <h3>
                        ${escapeHTML(
                            task.name
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            task.description
                        )}
                    </p>


                    <div class="task-meta">

                        <span class="task-time">

                            ⏰
                            ${formatTime(
                                task.start
                            )}

                            →

                            ${formatTime(
                                task.end
                            )}

                        </span>


                        <span class="category">

                            ${escapeHTML(
                                task.category
                            )}

                        </span>

                    </div>

                </div>


                <div class="task-actions">


                    <button
                        class="icon-btn focus-task"
                        data-id="${task.id}"
                        title="Start task timer">

                        ▶️

                    </button>


                    <button
                        class="icon-btn edit"
                        data-id="${task.id}"
                        title="Edit task">

                        ✏️

                    </button>


                    <button
                        class="icon-btn delete"
                        data-id="${task.id}"
                        title="Delete task">

                        🗑️

                    </button>


                </div>

            `;


            taskContainer.appendChild(
                element
            );

        }
    );


    attachTaskEvents();

}


// =====================================================
// TASK EVENTS
// =====================================================

function attachTaskEvents() {


    // ================= COMPLETE =================

    document
        .querySelectorAll(".task-check")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );


                    const task =
                        tasks.find(
                            item =>
                                item.id ===
                                id
                        );


                    if (!task) {
                        return;
                    }


                    task.completed =
                        !task.completed;


                    saveTasks();

                    renderTasks();

                    updateStats();


                    if (
                        task.completed
                    ) {

                        showToast(
                            "Task completed! 🎉"
                        );

                    }

                }
            );

        });



    // ================= FOCUS =================

    document
        .querySelectorAll(".focus-task")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );


                    startTaskFocus(
                        id
                    );

                }
            );

        });



    // ================= EDIT =================

    document
        .querySelectorAll(".edit")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    editTask(
                        Number(
                            button.dataset.id
                        )
                    );

                }
            );

        });



    // ================= DELETE =================

    document
        .querySelectorAll(".delete")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );


                    if (
                        activeTaskId ===
                        id
                    ) {

                        resetTimer();

                        activeTaskId =
                            null;

                        document.getElementById(
                            "activeTaskName"
                        ).textContent =
                            "Select a task to start";

                        document.getElementById(
                            "timerTaskInfo"
                        ).textContent =
                            "No task selected";

                    }


                    tasks =
                        tasks.filter(
                            task =>
                                task.id !==
                                id
                        );


                    saveTasks();

                    renderTasks();

                    updateStats();


                    showToast(
                        "Task deleted."
                    );

                }
            );

        });

}


// =====================================================
// EDIT TASK
// =====================================================

function editTask(id) {

    const task =
        tasks.find(
            item =>
                item.id === id
        );


    if (!task) {
        return;
    }


    editingTaskId =
        id;


    document.getElementById(
        "taskModalTitle"
    ).textContent =
        "Edit Task";


    document.getElementById(
        "taskName"
    ).value =
        task.name;


    document.getElementById(
        "taskDescription"
    ).value =
        task.description;


    document.getElementById(
        "taskStart"
    ).value =
        task.start;


    document.getElementById(
        "taskEnd"
    ).value =
        task.end;


    document.getElementById(
        "taskCategory"
    ).value =
        task.category;


    taskModal.classList.add(
        "show"
    );

}


// =====================================================
// SEARCH
// =====================================================

searchTask.addEventListener(
    "input",
    renderTasks
);


// =====================================================
// STATISTICS
// =====================================================

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const remaining =
        total -
        completed;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (
                    completed /
                    total
                ) * 100
            );


    document.getElementById(
        "totalTasks"
    ).textContent =
        total;


    document.getElementById(
        "completedTasks"
    ).textContent =
        completed;


    document.getElementById(
        "remainingTasks"
    ).textContent =
        remaining;


    document.getElementById(
        "progressPercent"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "progressFill"
    ).style.width =
        percentage + "%";


    document.getElementById(
        "streak"
    ).textContent =
        completed > 0
            ? Math.min(
                completed,
                30
            )
            : 0;

}


// =====================================================
// 30 DAY ROUTINE
// =====================================================

routineForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const name =
            document
                .getElementById(
                    "routineName"
                )
                .value
                .trim();


        const time =
            document
                .getElementById(
                    "routineTime"
                )
                .value;


        const duration =
            Number(
                document
                    .getElementById(
                        "routineDuration"
                    )
                    .value
            );


        const category =
            document
                .getElementById(
                    "routineCategory"
                )
                .value;


        const newRoutine = {

            id: Date.now(),

            name: name,

            time: time,

            duration: duration,

            category: category,

            days:
                Array(30).fill(false)

        };


        routines.push(
            newRoutine
        );


        saveRoutines();

        renderRoutines();


        routineModal.classList.remove(
            "show"
        );


        showToast(
            "30-day routine created! 📅"
        );

    }
);


// =====================================================
// RENDER ROUTINES
// =====================================================

function renderRoutines() {

    const container =
        document.getElementById(
            "routineContainer"
        );


    container.innerHTML = "";


    if (
        routines.length === 0
    ) {

        container.innerHTML = `

            <div class="content-card">

                <h3>
                    No routines yet.
                </h3>

                <p>
                    Create your first 30-day routine.
                </p>

            </div>

        `;

        updateMonthlyProgress();

        return;

    }


    routines.forEach(
        routine => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "routine-card";


            let daysHTML = "";


            routine.days.forEach(
                (done, index) => {

                    daysHTML += `

                        <button
                            class="day-dot
                            ${
                                done
                                    ? "done"
                                    : ""
                            }"
                            data-routine="${
                                routine.id
                            }"
                            data-day="${index}">

                            ${index + 1}

                        </button>

                    `;

                }
            );


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        routine.name
                    )}
                </h3>


                <p>

                    ⏰
                    ${formatTime(
                        routine.time
                    )}

                    •
                    ${routine.duration}
                    minutes

                </p>


                <span class="category">

                    ${escapeHTML(
                        routine.category
                    )}

                </span>


                <div class="routine-days">

                    ${daysHTML}

                </div>


                <div class="routine-actions">

                    <small>
                        Click a day when completed
                    </small>


                    <button
                        class="icon-btn delete-routine"
                        data-id="${routine.id}">

                        🗑️

                    </button>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    attachRoutineEvents();

    updateMonthlyProgress();

}


// =====================================================
// ROUTINE EVENTS
// =====================================================

function attachRoutineEvents() {


    document
        .querySelectorAll(".day-dot")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const routineId =
                        Number(
                            button.dataset.routine
                        );


                    const day =
                        Number(
                            button.dataset.day
                        );


                    const routine =
                        routines.find(
                            item =>
                                item.id ===
                                routineId
                        );


                    if (!routine) {
                        return;
                    }


                    routine.days[day] =
                        !routine.days[day];


                    saveRoutines();

                    renderRoutines();

                }
            );

        });



    document
        .querySelectorAll(
            ".delete-routine"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );


                    routines =
                        routines.filter(
                            routine =>
                                routine.id !==
                                id
                        );


                    saveRoutines();

                    renderRoutines();


                    showToast(
                        "Routine deleted."
                    );

                }
            );

        });

}


// =====================================================
// MONTHLY PROGRESS
// =====================================================

function updateMonthlyProgress() {

    let total = 0;

    let completed = 0;


    routines.forEach(
        routine => {

            routine.days.forEach(
                done => {

                    total++;


                    if (done) {
                        completed++;
                    }

                }
            );

        }
    );


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (
                    completed /
                    total
                ) * 100
            );


    document.getElementById(
        "monthlyPercent"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "monthlyFill"
    ).style.width =
        percentage + "%";

}


// =====================================================
// TASK BASED FOCUS TIMER
// =====================================================

let timerSeconds = 0;

let originalTimerSeconds = 0;

let timerInterval = null;

let timerRunning = false;

let activeTaskId = null;


// =====================================================
// CALCULATE TASK DURATION
// =====================================================

function getTaskDuration(task) {

    const start =
        task.start.split(":");


    const end =
        task.end.split(":");


    let startMinutes =
        Number(start[0]) * 60 +
        Number(start[1]);


    let endMinutes =
        Number(end[0]) * 60 +
        Number(end[1]);


    /*
        Agar end time next day ho
    */

    if (
        endMinutes <=
        startMinutes
    ) {

        endMinutes +=
            24 * 60;

    }


    const durationMinutes =
        endMinutes -
        startMinutes;


    return durationMinutes * 60;

}


// =====================================================
// START TASK FOCUS
// =====================================================

function startTaskFocus(taskId) {

    const task =
        tasks.find(
            item =>
                item.id === taskId
        );


    if (!task) {
        return;
    }


    /*
        Agar naya task select hua
        to uski duration calculate karo
    */

    if (
        activeTaskId !==
        taskId
    ) {

        clearInterval(
            timerInterval
        );


        timerRunning =
            false;


        activeTaskId =
            taskId;


        timerSeconds =
            getTaskDuration(
                task
            );


        originalTimerSeconds =
            timerSeconds;

    }


    updateTimerInformation(
        task
    );


    updateTimerDisplay();


    /*
        Dashboard se timer start
    */

    startTimer();


    /*
        Timer page bhi dikha sakte hain
    */

    showToast(
        "Focus started: " +
        task.name +
        " 🔥"
    );

}


// =====================================================
// UPDATE TIMER INFORMATION
// =====================================================

function updateTimerInformation(task) {

    document.getElementById(
        "activeTaskName"
    ).textContent =
        "📚 " + task.name;


    document.getElementById(
        "timerTaskInfo"
    ).textContent =

        formatTime(
            task.start
        )
        +
        " → "
        +
        formatTime(
            task.end
        );


    document.getElementById(
        "bigTimerTaskName"
    ).textContent =
        task.name;


    document.getElementById(
        "bigTimerTaskTime"
    ).textContent =

        formatTime(
            task.start
        )
        +
        " → "
        +
        formatTime(
            task.end
        );

}


// =====================================================
// START TIMER
// =====================================================

function startTimer() {

    if (
        timerRunning
    ) {
        return;
    }


    if (
        activeTaskId ===
        null
    ) {

        alert(
            "Please select a task first."
        );

        return;

    }


    if (
        timerSeconds <=
        0
    ) {

        alert(
            "This task has no remaining time."
        );

        return;

    }


    timerRunning =
        true;


    document.getElementById(
        "timerStatus"
    ).textContent =
        "Focus Mode 🔥";


    timerInterval =
        setInterval(
            () => {

                if (
                    timerSeconds >
                    0
                ) {

                    timerSeconds--;

                    updateTimerDisplay();

                }


                if (
                    timerSeconds ===
                    0
                ) {

                    finishTimer();

                }

            },
            1000
        );

}


// =====================================================
// FINISH TIMER
// =====================================================

function finishTimer() {

    clearInterval(
        timerInterval
    );


    timerRunning =
        false;


    document.getElementById(
        "timerStatus"
    ).textContent =
        "Completed ✅";


    playAlarm();


    completeActiveTask();


    showToast(
        "⏰ Focus session completed!"
    );

}


// =====================================================
// COMPLETE ACTIVE TASK
// =====================================================

function completeActiveTask() {

    if (
        activeTaskId ===
        null
    ) {
        return;
    }


    const task =
        tasks.find(
            item =>
                item.id ===
                activeTaskId
        );


    if (task) {

        task.completed =
            true;


        saveTasks();

        renderTasks();

        updateStats();

    }

}


// =====================================================
// PAUSE TIMER
// =====================================================

function pauseTimer() {

    clearInterval(
        timerInterval
    );


    timerRunning =
        false;


    document.getElementById(
        "timerStatus"
    ).textContent =
        "Paused ⏸️";

}


// =====================================================
// RESET TIMER
// =====================================================

function resetTimer() {

    clearInterval(
        timerInterval
    );


    timerRunning =
        false;


    if (
        activeTaskId !==
        null
    ) {

        const task =
            tasks.find(
                item =>
                    item.id ===
                    activeTaskId
            );


        if (task) {

            timerSeconds =
                getTaskDuration(
                    task
                );


            originalTimerSeconds =
                timerSeconds;

        }

    }
    else {

        timerSeconds =
            0;

    }


    updateTimerDisplay();


    document.getElementById(
        "timerStatus"
    ).textContent =
        "Ready";

}


// =====================================================
// TIMER DISPLAY
// =====================================================

function updateTimerDisplay() {

    const minutes =
        Math.floor(
            timerSeconds / 60
        );


    const seconds =
        timerSeconds % 60;


    const formatted =

        String(minutes)
            .padStart(2, "0")

        +

        ":"

        +

        String(seconds)
            .padStart(2, "0");


    document.getElementById(
        "timerDisplay"
    ).textContent =
        formatted;


    document.getElementById(
        "bigTimerDisplay"
    ).textContent =
        formatted;

}


// =====================================================
// TIMER BUTTONS
// =====================================================

document
    .getElementById(
        "startTimer"
    )
    .addEventListener(
        "click",
        startTimer
    );


document
    .getElementById(
        "pauseTimer"
    )
    .addEventListener(
        "click",
        pauseTimer
    );


document
    .getElementById(
        "resetTimer"
    )
    .addEventListener(
        "click",
        resetTimer
    );


document
    .getElementById(
        "bigStart"
    )
    .addEventListener(
        "click",
        startTimer
    );


document
    .getElementById(
        "bigPause"
    )
    .addEventListener(
        "click",
        pauseTimer
    );


document
    .getElementById(
        "bigReset"
    )
    .addEventListener(
        "click",
        resetTimer
    );


// =====================================================
// ALARM
// =====================================================

function playAlarm() {

    try {

        const audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        const oscillator =
            audioContext
                .createOscillator();


        const gain =
            audioContext
                .createGain();


        oscillator.connect(
            gain
        );


        gain.connect(
            audioContext.destination
        );


        oscillator.frequency.value =
            800;


        oscillator.type =
            "sine";


        gain.gain.value =
            0.4;


        oscillator.start();


        setTimeout(
            () => {

                oscillator.stop();

            },
            1200
        );

    }
    catch (error) {

        console.log(
            "Alarm could not play."
        );

    }

}


// =====================================================
// TOAST
// =====================================================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


// =====================================================
// FORMAT TIME
// =====================================================

function formatTime(time) {

    if (!time) {
        return "";
    }


    const parts =
        time.split(":");


    const hour =
        Number(parts[0]);


    const minute =
        Number(parts[1]);


    const date =
        new Date();


    date.setHours(
        hour
    );


    date.setMinutes(
        minute
    );


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// =====================================================
// SECURITY HELPER
// =====================================================

function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// INITIAL LOAD
// =====================================================

renderTasks();

renderRoutines();

updateStats();

updateTimerDisplay();