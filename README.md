```markdown
# 🧾 Accounting System – Angular Frontend

This project is the **frontend** of a complete accounting management system built with **Angular**.  
It provides features for user management, chart of accounts, journal entries, general ledger, and balance sheet visualization.

---

## 🚀 Features

- 🔐 **Authentication system** (JWT-based login)
- 👥 **User management** (admin-only access)
- 🧮 **Chart of Accounts** (tree view and admin CRUD)
- 🧾 **Journal Entries** (create and view accounting entries)
- 📘 **General Ledger** (filter by account and date)
- 📊 **Balance Sheet** (calculated on the frontend)
- 🎨 Built with **Bootstrap 5** for a clean, modern UI

---

## 🛠️ Tech Stack

- **Angular 17+**
- **TypeScript**
- **Bootstrap 5**
- **RxJS / Observables**
- **REST API integration** with a Spring Boot backend

---

## 📂 Project Structure

```

src/
├── app/
│ ├── accounts/ # Account management & tree view
│ ├── core/ # Guards, models, and services
│ ├── entries/ # Journal entries, ledger, and balance
│ ├── login/ # Authentication
│ ├── users/ # User management module
│ ├── dashboard/ # Main dashboard and summary
│ └── app.routes.ts # Application routing
└── assets/ # Static resources

````

---

## ⚙️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ShadowHachiman/Fornt-Final-V3.git
   cd Fornt-Final-V3
````

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   ng serve
   ```

   Open your browser at **[http://localhost:4200](http://localhost:4200)**

---

## 🔧 Configuration

Make sure the backend API URL is correctly set in:

```
src/environments/environment.ts
```

Example:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

---

## 👑 Roles and Permissions

| Role      | Permissions                                          |
| --------- | ---------------------------------------------------- |
| **Admin** | Full access to users, accounts, entries, and reports |
| **User**  | Can view accounts, ledger, and create entries        |

---

## 📘 Example Screens

* Login page
* Dashboard summary
* Chart of accounts (tree view)
* Journal entry creation
* General ledger filter and table
* Balance sheet view

---

## 🧑‍💻 Authors

* **ShadowHachiman** – Developer
  🔗 [GitHub Profile](https://github.com/ShadowHachiman)

---

## 📄 License

This project is licensed under the **MIT License**.
Feel free to use and modify it as needed.

---

> 💡 *Built with Angular, designed for clarity, and focused on accounting simplicity.*

```

---

Would you like me to translate this README into **Spanish** as well (keeping the English technical terms)?  
That way, you can include both languages for clarity on GitHub.
```
