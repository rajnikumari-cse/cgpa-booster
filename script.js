
const semesterForm = document.getElementById("gradeForm");
const semesterName = document.getElementById("semesterName");
const sgpaInput = document.getElementById("sgpa");

const targetInput = document.getElementById("target");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskPriority = document.getElementById("taskPriority");

let semesters = JSON.parse(
  localStorage.getItem("cgpaBoosterSemesters") || "[]"
);

let tasks = JSON.parse(
  localStorage.getItem("cgpaBoosterTasks") || "[]"
);

let target = Number(
  localStorage.getItem("cgpaBoosterTarget") || 8
);

let chart = null;

// Save data
function saveData() {
  localStorage.setItem(
    "cgpaBoosterSemesters",
    JSON.stringify(semesters)
  );

  localStorage.setItem(
    "cgpaBoosterTasks",
    JSON.stringify(tasks)
  );

  localStorage.setItem("cgpaBoosterTarget", target);
}

// Show semester records
function renderSemesters() {
  const records = document.getElementById("records");
  records.innerHTML = "";

  semesters.forEach((semester, index) => {
    const row = document.createElement("div");
    row.className = "record-row";

    const name = document.createElement("span");
    name.textContent = semester.name;

    const score = document.createElement("span");
    score.textContent = Number(semester.sgpa).toFixed(2);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";

    deleteButton.addEventListener("click", () => {
      semesters.splice(index, 1);
      saveData();
      updateDashboard();
    });

    row.append(name, score, deleteButton);
    records.appendChild(row);
  });
}

// Add semester SGPA
semesterForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = semesterName.value;
  const sgpa = Number(sgpaInput.value);

  if (!name || !Number.isFinite(sgpa) || sgpa < 0 || sgpa > 10) {
    alert("Please enter a valid semester and SGPA between 0 and 10.");
    return;
  }

  const alreadyExists = semesters.some(
    semester => semester.name === name
  );

  if (alreadyExists) {
    alert("Is semester ka record pehle se add hai.");
    return;
  }

  semesters.push({ name, sgpa });
  saveData();
  semesterForm.reset();
  updateDashboard();
});

// Update chart
function updateChart() {
  const canvas = document.getElementById("performanceChart");

  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: semesters.map(item => item.name),
      datasets: [{
        label: "Semester SGPA",
        data: semesters.map(item => item.sgpa),
        borderColor: "#7650c9",
        backgroundColor: "rgba(118, 80, 201, 0.15)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 10
        }
      }
    }
  });
}

// Update dashboard numbers
function updateDashboard() {
  renderSemesters();

  const count = semesters.length;
  const average = count
    ? semesters.reduce((sum, item) => sum + Number(item.sgpa), 0) / count
    : 0;

  document.getElementById("recordCount").textContent = count;
  document.getElementById("semesterCount").textContent = count;
  document.getElementById("averageSGPA").textContent = average.toFixed(2);

  const progress = Math.min((average / target) * 100, 100);

  document.getElementById("goalProgress").textContent =
    progress.toFixed(0) + "%";

  document.getElementById("goalBar").style.width =
    progress + "%";

  document.getElementById("goalMessage").textContent =
    count === 0
      ? "Add your semester SGPA to track your progress."
      : average >= target
        ? "Great! Your average SGPA has reached your target."
        : "Keep studying to reach your target SGPA.";

  updateChart();
}

// Save target SGPA
if (targetInput) {
  targetInput.value = target;

  targetInput.addEventListener("change", function () {
    const newTarget = Number(targetInput.value);

    if (!Number.isFinite(newTarget) || newTarget <= 0 || newTarget > 10) {
      alert("Target SGPA 0 se zyada aur 10 ya usse kam honi chahiye.");
      targetInput.value = target;
      return;
    }

    target = newTarget;
    document.getElementById("targetDisplay").textContent =
      target.toFixed(2);

    saveData();
    updateDashboard();
  });
}

// Render study tasks
function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const item = document.createElement("div");
    item.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", () => {
      tasks[index].completed = checkbox.checked;
      saveData();
      renderTasks();
    });

    const details = document.createElement("span");
    details.textContent = `${task.text} (${task.priority})`;

    if (task.completed) {
      details.style.textDecoration = "line-through";
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveData();
      renderTasks();
    });

    item.append(checkbox, details, deleteButton);
    taskList.appendChild(item);
  });

  const completed = tasks.filter(task => task.completed).length;
  const progress = tasks.length
    ? (completed / tasks.length) * 100
    : 0;

  document.getElementById("tasksDone").textContent =
    `${completed}/${tasks.length}`;

  document.getElementById("taskProgress").textContent =
    `${Math.round(progress)}%`;

  document.getElementById("taskBar").style.width =
    `${progress}%`;
}

// Add study task
taskForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    alert("Please enter a study task.");
    return;
  }

  tasks.push({
    text,
    priority: taskPriority.value,
    completed: false
  });

  saveData();
  taskForm.reset();
  renderTasks();
});

// Load saved data on page open
document.getElementById("targetDisplay").textContent =
  target.toFixed(2);

updateDashboard();
renderTasks();
