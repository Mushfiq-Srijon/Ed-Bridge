# Ed-Bridge

## Academic Resource-Sharing Platform for Students

Ed-Bridge is a student-focused web platform designed to make academic resources, peer support, and educational collaboration more accessible.

The platform allows students to share academic notes, participate in discussions, buy and sell educational materials, communicate with other students, and manage their academic activities from one place.

## Features

- User registration and secure login
- JWT-based authentication and authorization
- Student profile management
- Profile photo upload and removal
- Academic notes sharing
- PDF note uploads and downloads
- Note search and subject-based filtering
- Note comments, ratings, bookmarks, and reporting
- Academic discussion forum
- Forum posts and replies
- Post upvotes and downvotes
- Post following and bookmarking
- Forum content reporting
- Academic materials marketplace
- Marketplace search and filtering
- Listing creation, editing, deletion, and status management
- Marketplace messaging between buyers and sellers
- Saved notes, listings, and forum posts
- Personal student dashboard
- Admin dashboard
- User suspension and reinstatement
- Content moderation and reporting management
- Platform analytics for administrators
- Light and dark theme support
- Responsive user interface

## Technology Stack

### Frontend

- React
- React Router
- JavaScript
- CSS

### Backend

- ASP.NET Core Web API
- .NET 10
- Entity Framework Core
- JWT Bearer Authentication
- Swagger

### Database

- MySQL
- Pomelo Entity Framework Core Provider

## Project Structure

    Ed-Bridge/
    ├── EdBridge.API/
    │   ├── Controllers/
    │   ├── Data/
    │   ├── DTOs/
    │   ├── Migrations/
    │   ├── Middleware/
    │   ├── Models/
    │   ├── Properties/
    │   ├── Services/
    │   ├── appsettings.json
    │   ├── EdBridge.API.csproj
    │   └── Program.cs
    │
    ├── frontend/
    │   ├── public/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── context/
    │   │   ├── data/
    │   │   ├── pages/
    │   │   ├── services/
    │   │   ├── styles/
    │   │   ├── utils/
    │   │   ├── App.js
    │   │   └── index.js
    │   ├── package.json
    │   └── README.md
    │
    ├── .gitignore
    └── README.md

## Prerequisites

Before running the project, make sure the following software is installed:

- Git
- .NET 10 SDK
- Node.js and npm
- MySQL
- Entity Framework Core CLI tools

## Installation

### 1. Clone the repository

    git clone https://github.com/Mushfiq-Srijon/Ed-Bridge
    cd Ed-Bridge

### 2. Create the database

Create a MySQL database named:

    ed_bridge

### 3. Configure the backend

Update the backend configuration in `EdBridge.API/appsettings.Development.json` or use environment variables.

Example configuration:

    {
      "ConnectionStrings": {
        "DefaultConnection": "server=localhost;port=3306;database=ed_bridge;user=YOUR_USERNAME;password=YOUR_PASSWORD;Charset=utf8mb4;"
      },
      "Jwt": {
        "Key": "replace-this-with-a-secure-key-of-at-least-32-characters",
        "Issuer": "ed-bridge-api",
        "Audience": "ed-bridge-users"
      }
    }

For security, do not commit real database credentials or production JWT keys to the repository.

### 4. Apply database migrations

Navigate to the backend directory:

    cd EdBridge.API
    dotnet ef database update

If the Entity Framework CLI is not installed, install it using:

    dotnet tool install --global dotnet-ef

### 5. Run the backend

From the `EdBridge.API` directory, run:

    dotnet run

The backend API will be available at:

    http://localhost:5180

Swagger API documentation will be available at:

    http://localhost:5180/swagger

### 6. Run the frontend

Open a separate terminal and run:

    cd frontend
    npm install
    npm start

The frontend will be available at:

    http://localhost:3000

The frontend communicates with the backend through:

    http://localhost:5180/api

## Application Modules

### Authentication and Profiles

Users can register, log in, update their profiles, upload profile photos, change passwords, and delete their accounts.

### Academic Notes

Students can upload and share academic notes in PDF format. Users can search notes, filter them by subject, download files, add comments, provide ratings, save notes, and report inappropriate content.

### Discussion Forum

The forum allows students to ask academic questions, reply to discussions, vote on posts and replies, follow discussions, save useful posts, and report inappropriate content.

### Marketplace

Students can create listings for used academic materials. Other users can browse, search, filter, save, report, and contact sellers through the messaging system.

### Messaging

Authenticated users can communicate with marketplace participants through listing-based conversations.

### Student Dashboard

The dashboard provides an overview of a user's listings, notes, and forum posts.

### Administration

Administrators can manage users, notes, forum posts, marketplace listings, reports, and platform analytics through the administrative dashboard.

## Authentication

Ed-Bridge uses JWT Bearer Authentication.

Authenticated requests include the following HTTP header:

    Authorization: Bearer <access-token>

Administrative features are protected using role-based authorization and are available only to users with the `Admin` role.

## API Controllers

The backend includes the following main API areas:

- `/api/auth`
- `/api/notes`
- `/api/posts`
- `/api/listings`
- `/api/messages`
- `/api/admin`
- `/api/user`

Complete endpoint documentation is available through Swagger while the backend is running.

## Development Notes

- The backend supports file uploads up to 50 MB.
- CORS is configured for the React development server at `http://localhost:3000`.
- Uploaded files are served as static files by the backend.
- Database changes are managed using Entity Framework Core migrations.
- The development API uses port `5180`.
- The development frontend uses port `3000`.

## Available Scripts

### Frontend

Start the development server:

    npm start

Run frontend tests:

    npm test

Create a production build:

    npm run build

### Backend

Run the backend:

    dotnet run

Apply database migrations:

    dotnet ef database update

Create a new migration:

    dotnet ef migrations add MigrationName

## Sustainable Development Goals

Ed-Bridge supports the following United Nations Sustainable Development Goals:

- **SDG 4 — Quality Education**
- **SDG 10 — Reduced Inequalities**
- **SDG 12 — Responsible Consumption and Production**

## Team and Project Information

Ed-Bridge was developed as a collaborative academic software project by a team of four developers over a 15-week development period.

The project focuses on improving access to educational resources, encouraging peer-to-peer learning, and promoting the reuse of academic materials.

## Contributors

| Name | Role |
|---|---|
| MD. Mushfiqur Rahman | Backend & Frontend Developer |
| Sabikun Alam | Backend & Frontend Developer |
| Maimuna Momtaj Emu | Frontend Developer |
| MD. Mahedi Hasan Oni | Frontend Developer |

---

## Security Considerations

For production deployment:

- Use secure environment variables for secrets.
- Replace development JWT keys with strong production keys.
- Use a dedicated database user instead of the root account.
- Enable HTTPS.
- Restrict CORS to trusted frontend domains.
- Configure secure file storage for uploaded resources.
- Review and validate all uploaded files.

## License

This project was developed for academic and educational purposes.
