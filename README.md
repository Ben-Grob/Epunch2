# Epunch
Epunch is a simple, cross-platform time tracking application built for small to medium-sized businesses. It streamlines the "punch-in/out" process for employees while providing oversight for managers.

## Key Features
For Employees:
- Onboarding: Join an existing company with a compnayID.
- One-Tap Punching: Simple interface to clock in and out of shifts.
- Punch Card Overview: Ability to view prevoius shifts and see how many hours they have worked

For Managers:
- Company Creation: Register a new company and automatically become the primary administrator.
- Staff Oversight: View all employee shifts and time logs within your specific company.

## Tech Stack
Frontend: React Native with ExpoRouting: 
   Expo Router (File-based routing)
   
Backend: Appwrite (Authentication, Database, and Permissions)
Styling: NativeWind (Tailwind CSS for React Native)
Icons: Ionicons 
Database Architecture: The app utilizes a relational structure within Appwrite's Document model. 

The core of the application revolves around the relationship between Companies, Users, and Shifts.
| Collection | Description |
| :--- | :--- |
| Company | Stores company name and id, links to user |
| Shift | Stores shift info and links to a user |
| User | Stores user info and links to a company and has isManager flag |



## Installation & Setup
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

## Permissions & Logic
Permissions are role dependant and defined in appwrite. CLASSIFIED!! (JK, I don't feel like updating the md anymore. Coming soon!)
