
const API_URL = "http://localhost:3000/api/expenses";

const tableBody = document.getElementById("expenseTableBody");
const spinner=document.getElementById("spinner");
const alertBox = document.getElementById("alertBox");
const totalAmountEl=document.getElementById("totalAmount");
const expenseCountEl =document.getElementById("expenseCount");
const highestExpenseEl =document.getElementById("highestExpense");
const categoryFilterEl = document.getElementById("categoryFilter");
const addExpenseForm = document.getElementById("addExpenseForm");
const titleInput = document.getElementById("titleInput");
const amountInput = document.getElementById("amountInput");
const categoryInput = document.getElementById("categoryInput");
const dateInput = document.getElementById("dateInput");
const editModalEl = document.getElementById("editModal");
const editExpenseForm = document.getElementById("editExpenseForm");
const editIdInput = document.getElementById("editIdInput");
const editTitleInput = document.getElementById("editTitleInput");
const editAmountInput = document.getElementById("editAmountInput");
const editCategoryInput = document.getElementById("editCategoryInput");
const editDateInput = document.getElementById("editDateInput");
const themeToggleBtn = document.getElementById("themeToggle");

const editModal = new bootstrap.Modal(editModalEl);
themeToggleBtn.addEventListener("click", function () {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-bs-theme") === "dark";

  if (isDark) {
    html.setAttribute("data-bs-theme", "light");
    themeToggleBtn.textContent = "🌙 Dark mode";
  } else {
    html.setAttribute("data-bs-theme", "dark");
    themeToggleBtn.textContent = "☀️ Light mode";
  }
});

addExpenseForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = titleInput.value;
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  const data = {
    title: title,
    amount: amount,
    category: category,
    date: date
  };

  try {
    await addExpense(data);
    addExpenseForm.reset();

  } catch (error) {
    console.error(error);
    alertBox.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
});
editExpenseForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const id = Number(editIdInput.value);
  const title = editTitleInput.value;
  const amount = Number(editAmountInput.value);
  const category = editCategoryInput.value;
  const date = editDateInput.value;
  const editAlertBox = document.getElementById("editAlertBox");

  const data = {
    title: title,
    amount: amount,
    category: category,
    date: date
  };

  try {
    await updateExpense(id, data);
    editModal.hide();

  } catch (error) {
    console.error(error);
editAlertBox.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;  }
});

async function updateExpense(id, data) {
  const response = await fetch(API_URL + "/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  refresh();
}

function openEditModal(expense) {
  editIdInput.value = expense.id;
  editTitleInput.value = expense.title;
  editAmountInput.value = expense.amount;
  editCategoryInput.value = expense.category;
  editDateInput.value = expense.date;

  editModal.show();
}
async function getExpenses() {
    const response =await fetch(API_URL);
    if(!response.ok)
    {
        throw new Error("Server error: " + response.status);

    }
    return await response.json();
    
}

function renderTable(expenses) {
  tableBody.innerHTML="";
  for (const expense of expenses)
  {
     const row = `<tr>
    <td>${expense.title}</td>
    <td>${expense.amount}</td>
    <td>${expense.category}</td>
    <td>${expense.date}</td>
   <td>
   <button class="btn btn-sm btn-outline-primary" onclick='openEditModal(${JSON.stringify(expense)})'>Edit</button>
  <button class="btn btn-sm btn-outline-danger"  onclick="deleteExpense(${expense.id})">Delete</button>
</td>
  </tr>`;

  tableBody.innerHTML += row;
  }
}

function renderSummary(expenses) {
  let total = 0;
  let highest = 0;

  for (const expense of expenses) {
    total += expense.amount;

    if (expense.amount > highest) {
      highest = expense.amount;
    }
  }

  const count = expenses.length;
   totalAmountEl.textContent = total;
  expenseCountEl.textContent = count;
  highestExpenseEl.textContent = highest;

}

async function refresh() {
  spinner.classList.remove("d-none");
  alertBox.innerHTML = "";

  try {
    const expense = await getExpenses();

    const selectedCategory = categoryFilterEl.value;

    let filtered = expense;
    if (selectedCategory !== "All") {
      filtered = expense.filter(function (item) {
        return item.category === selectedCategory;
      });
    }

    renderTable(filtered);
    renderSummary(filtered);

  } catch (error) {
    console.error(error);
    alertBox.innerHTML = `<div class="alert alert-danger">Could not load expenses. Is the server running?</div>`;

  } finally {
    spinner.classList.add("d-none");
  }
}
async function deleteExpense(id) {
  const response = await fetch(API_URL + "/" + id, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Server error: " + response.status);
  }

  refresh();
}
async function addExpense(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  refresh();
}

categoryFilterEl.addEventListener("change", refresh);
refresh();