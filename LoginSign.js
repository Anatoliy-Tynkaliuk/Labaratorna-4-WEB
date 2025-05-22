

function openRegisterModal() {
  document.getElementById("registerModal").style.display = "block";
}
function closeRegisterModal() {
  document.getElementById("registerModal").style.display = "none";
  document.getElementById("registerForm").reset();
  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
}

function openLoginModal() {
  document.getElementById("loginModal").style.display = "block";
}
function closeLoginModal() {
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("loginForm").reset();
  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
}

document.getElementById("switchToRegister").addEventListener("click", function (e) {
  e.preventDefault();
  closeLoginModal();
  openRegisterModal();
});

// Валідація форми реєстрації
const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));

  const loginVal = document.getElementById("login").value.trim();
  const emailVal = document.getElementById("email").value.trim();
  const phoneVal = document.getElementById("phone").value.trim();
  const passwordVal = document.getElementById("password").value;
  const confirmPasswordVal = document.getElementById("confirmPassword").value;

  let hasError = false;

  if (loginVal.length < 3) {
    document.getElementById("loginError").textContent = "Логін має містити щонайменше 3 символи.";
    hasError = true;
  }

  if (!emailVal.endsWith("@gmail.com") || emailVal.length < 12) {
    document.getElementById("emailError").textContent = "Введіть коректну Gmail-адресу.";
    hasError = true;
  }

  if (!(phoneVal.startsWith("+380") && phoneVal.length === 13)) {
    document.getElementById("phoneError").textContent = "Телефон має бути у форматі +380XXXXXXXXX.";
    hasError = true;
  }

  if (passwordVal.length < 6) {
    document.getElementById("passwordError").textContent = "Пароль має містити мінімум 6 символів.";
    hasError = true;
  }

  let hasLetter = false;
  let hasDigit = false;
  let hasSpecial = false;

  for (let i = 0; i < passwordVal.length; i++) {
    const code = passwordVal.charCodeAt(i);
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) hasLetter = true;
    else if (code >= 48 && code <= 57) hasDigit = true;
    else hasSpecial = true;
  }

  if (!hasError) {
    let strength = "Слабкий";
    if (hasLetter && hasDigit && hasSpecial) strength = "Складний";
    else if ((hasLetter && hasDigit) || (hasLetter && hasSpecial) || (hasDigit && hasSpecial)) strength = "Середній";
    alert("Складність паролю: " + strength);
  }

  if (passwordVal !== confirmPasswordVal) {
    document.getElementById("confirmPasswordError").textContent = "Паролі не співпадають.";
    hasError = true;
  }


  if (!hasError) {
    if (emailVal === "admin@shop.com") {
      document.getElementById("emailError").textContent = "Цей email зарезервовано для адміністратора";
      return;
    }

    const body = {
      login: loginVal,
      email: emailVal,
      phone: phoneVal,
      password: passwordVal
    };

    try {
      const r = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
      });

      const msg = await r.json();
      if (r.ok) {
        alert("Успішна реєстрація!");
        closeRegisterModal();
      } else {
        document.getElementById("emailError").textContent = msg.msg;
      }
    } catch (e) {
      console.error("Помилка при реєстрації:", e);
    }
  }
});


const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const body = {
    email: loginEmail.value,
    password: loginPassword.value
  };
  try {
    const r = await fetch(`${API}/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body)
    });
    const user = await r.json();
    if (r.ok) {
      currentUser = user;
      if (user.role === "admin") {
        showAdminControls(); 
      }      
      document.getElementById("loginMessage").textContent = "Ви ввійшли!";
      closeLoginModal();
      

      // Оновити список товарів після входу (для відображення кнопок адміна)
      if (typeof fetchPosts === 'function') {
        fetchPosts();
      }
      
    } else {
      loginMessage.textContent = user.msg;
    }
    

  } catch (e) { console.error(e); }
});
