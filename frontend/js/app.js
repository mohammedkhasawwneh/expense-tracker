// ============================================================
// Part 1: Settings and DOM elements
// The API address, and a variable for every HTML element we use
// ============================================================
const API_URL = "http://localhost:3000/api/expenses";

// Table, spinner and alerts
const tableBody = document.getElementById("expenseTableBody");
const spinner = document.getElementById("spinner");
const alertBox = document.getElementById("alertBox");

// Summary cards
const totalAmountEl = document.getElementById("totalAmount");
const expenseCountEl = document.getElementById("expenseCount");
const highestExpenseEl = document.getElementById("highestExpense");
// Category filter
const categoryFilterEl = document.getElementById("categoryFilter");

// Add expense form
const addExpenseForm = document.getElementById("addExpenseForm");
const titleInput = document.getElementById("titleInput");
const amountInput = document.getElementById("amountInput");
const categoryInput = document.getElementById("categoryInput");
const dateInput = document.getElementById("dateInput");

// Edit expense modal and its form
const editModalEl = document.getElementById("editModal");
const editExpenseForm = document.getElementById("editExpenseForm");
const editIdInput = document.getElementById("editIdInput");
const editTitleInput = document.getElementById("editTitleInput");
const editAmountInput = document.getElementById("editAmountInput");
const editCategoryInput = document.getElementById("editCategoryInput");
const editDateInput = document.getElementById("editDateInput");
const editAlertBox = document.getElementById("editAlertBox");

// Dark mode button
const themeToggleBtn = document.getElementById("themeToggle");

// Turn the modal div into a Bootstrap Modal object (gives us show() and hide())
const editModal = new bootstrap.Modal(editModalEl);


// ============================================================
// Part 2: API functions (talk to the server)
// One function for each operation: GET, POST, PUT, DELETE
// ============================================================

// GET: get the list of all expenses
async function getExpenses() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Server error: " + response.status);
  }

  return await response.json();
}

// POST: send a new expense, then refresh the page
async function addExpense(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  // fetch does not throw on 400/404, so we check response.ok ourselves
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  refresh();
}

// PUT: send the new values of one expense, then refresh the page
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

// DELETE: delete one expense by id, then refresh the page
async function deleteExpense(id) {
  const response = await fetch(API_URL + "/" + id, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Server error: " + response.status);
  }

  refresh();
}


// ============================================================
// Part 3: Render functions (show data on the page)
// ============================================================

// Build one table row for every expense and put it in the tbody
function renderTable(expenses) {
  // Clear the old rows first
  tableBody.innerHTML = "";

  for (const expense of expenses) {
    const row = `<tr>
      <td>${expense.title}</td>
      <td>${expense.amount}</td>
      <td>${expense.category}</td>
      <td>${expense.date}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick='openEditModal(${JSON.stringify(expense)})'>Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense(${expense.id})">Delete</button>
      </td>
    </tr>`;

    tableBody.innerHTML += row;
  }
}

// Calculate the total, the count and the highest expense, then show them in the cards
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


// ============================================================
// Part 4: refresh (the main function)
// Shows the spinner, gets the data, applies the filter, then renders the page
// Every add / edit / delete / filter calls it, so the page always shows the truth
// ============================================================
async function refresh() {
  spinner.classList.remove("d-none");
  alertBox.innerHTML = "";

  try {
    const expense = await getExpenses();

    // Apply the category filter
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
    // Always hide the spinner, whether it worked or failed
    spinner.classList.add("d-none");
  }
}


// ============================================================
// Part 5: openEditModal
// Fills the modal fields with the current expense and opens it
// (called from the Edit button in each table row)
// ============================================================
function openEditModal(expense) {
  editIdInput.value = expense.id;
  editTitleInput.value = expense.title;
  editAmountInput.value = expense.amount;
  editCategoryInput.value = expense.category;
  editDateInput.value = expense.date;

  editModal.show();
}


// ============================================================
// Part 6: Events (what happens when the user does something)
// ============================================================

// Dark mode: switch data-bs-theme between "light" and "dark" on <html>
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

// Add form: read the fields, send them with POST, then clear the form
addExpenseForm.addEventListener("submit", async function (event) {
  // Stop the page from reloading
  event.preventDefault();

  // Read the values (amount is converted from text to number)
  const title = titleInput.value;
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  // The object the server expects in req.body
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
    // Show the server's error message (for example: "Title is required")
    console.error(error);
    alertBox.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
});

// Edit form: read the modal fields, send them with PUT, then close the modal
editExpenseForm.addEventListener("submit", async function (event) {
  // Stop the page from reloading
  event.preventDefault();

  // Read the values (id comes from the hidden input)
  const id = Number(editIdInput.value);
  const title = editTitleInput.value;
  const amount = Number(editAmountInput.value);
  const category = editCategoryInput.value;
  const date = editDateInput.value;

  // The object the server expects in req.body
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
    // Show the error inside the modal, so the user can see it
    console.error(error);
    editAlertBox.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
});

// Filter: reload and re-render when the selected category changes
categoryFilterEl.addEventListener("change", refresh);


// ============================================================
// Part 7: Start
// Load the expenses once when the page opens
// ============================================================
refresh();