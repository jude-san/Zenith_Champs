async function fetchState() {
  const response = await fetch("/api/state");
  if (!response.ok) {
    throw new Error("Failed to load project state.");
  }
  return response.json();
}

function renderList(containerId, items) {
  const list = document.getElementById(containerId);
  list.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

function renderComments(comments) {
  const commentsEl = document.getElementById("comments");
  commentsEl.innerHTML = "";
  comments.forEach((comment) => {
    const el = document.createElement("div");
    el.className = "comment";
    el.textContent = `${comment.author}: ${comment.text}`;
    commentsEl.appendChild(el);
  });
}

async function render() {
  const state = await fetchState();
  const task = state.tasks[0];

  document.getElementById("task-title").textContent = task.title;
  document.getElementById("suggested-options").textContent = task.suggestedOptions.join(" or ");
  renderList("task-list", task.checklist);
  document.getElementById("acceptance-criteria").textContent = task.acceptanceCriteria;
  document.getElementById("interswitch-use").textContent = state.notes.interswitchUse;
  renderList("hosting-frontend", state.notes.freeHosting.frontend);
  renderList("hosting-backend", state.notes.freeHosting.backend);
  renderList("hosting-database", state.notes.freeHosting.database);
  renderComments(task.comments);
}

async function postComment(text) {
  const response = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Failed to post comment.");
  }
}

document.getElementById("comment-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = document.getElementById("comment-input");
  const text = input.value.trim();
  if (!text) {
    return;
  }

  await postComment(text);
  input.value = "";
  await render();
});

render().catch((error) => {
  const commentsEl = document.getElementById("comments");
  commentsEl.textContent = error.message;
});
