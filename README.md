#Epunch
Epunch is a modern, cross-platform time tracking application built for small to medium-sized businesses. It streamlines the "punch-in/out" process for employees while providing robust oversight and company management tools for administrators.

## 🚀 Key Features
For Employees
- Seamless Onboarding: Join an existing company instantly using a unique Company ID.
- One-Tap Punching: Simple interface to clock in and out of shifts.
- Privacy-First: Secure profile management and clear visibility of personal work history.

For Managers
- Company Creation: Register a new company and automatically become the primary administrator.
- Staff Oversight: View all employee shifts and time logs within your specific company.
- Data Integrity: Built-in "Soft Delete" logic ensures that payroll history is preserved even if records are modified.

## 🛠 Tech Stack
Frontend: React Native with ExpoRouting: 
   Expo Router (File-based routing)
Backend: Appwrite (Authentication, Database, and Permissions)
Styling: NativeWind (Tailwind CSS for React Native)
Icons: Ionicons📊 Database ArchitectureThe app utilizes a relational structure within Appwrite's Document model. 

The core of the application revolves around the relationship between Companies, Users, and Shifts.CollectionRelationshipDescriptionCompaniesOne-to-ManyStores company name and unique IDs.UsersMany-to-OneBelongs to a Company; contains isManager role flag.ShiftsMany-to-OneBelongs to a User; stores clock-in/out timestamps.Note on Data Integrity: Shifts use a "Soft Delete" pattern (isDeleted flag) rather than hard deletion to maintain an audit trail for payroll compliance.


## ⚙️ Installation & Setup
Clone the repository:Bashgit clone https://github.com/yourusername/epunch.git

cd epunch

### Install dependencies:
Bashnpm install
Configure Appwrite:Create a .env file in the root directory and add your Appwrite credentials:Code snippetEXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID=your_collection_id
EXPO_PUBLIC_APPWRITE_COMPANIES_COLLECTION_ID=your_collection_id
EXPO_PUBLIC_APPWRITE_SHIFTS_COLLECTION_ID=your_collection_id
Start the development server:Bashnpx expo start

## 🔐 Permissions & Logic
Epunch implements a strict permission model to ensure data security:Managers: Granted create, update, and read access to their company's collective shift data.Employees: Granted create and read access to their own documents only.Onboarding Flow: New Managers trigger a sequential logic that creates a Company document first, followed by a User profile linked via the resulting companyId.
