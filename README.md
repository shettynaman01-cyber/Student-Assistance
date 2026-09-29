# Student Assistance

An AI-powered full-stack student assistance platform that brings classroom management, assignments, study materials, doubt resolution, and intelligent PDF summarization into one unified learning environment.

## About the Project

Student Assistance is a web-based platform designed to make academic activities easier for both students and teachers.

The platform provides a centralized environment where students can manage their academic work, join classrooms, access study materials, communicate with teachers and classmates, and use AI to understand PDF-based learning content in a simpler and more accessible way.

Teachers can create classrooms, manage students and assignments, and communicate with students through the platform.

## Key Features

### 👨‍🎓 Student Features

* Student registration and login
* Personalized student dashboard
* Join classrooms using classroom codes
* View classroom information
* View and manage assignments
* Track assignment status and deadlines
* Access study materials
* Private communication with teachers
* Student group discussions
* AI-powered PDF summarization
* Simple and student-friendly learning assistance

### 👨‍🏫 Teacher Features

* Teacher registration and login
* Teacher dashboard
* Create and manage classrooms
* Manage classroom students
* Create and manage assignments
* Share study materials
* Communicate privately with students
* Communicate with classroom student groups

### 🤖 AI-Powered PDF Assistance

The platform integrates the **Google Gemini API** to provide AI-based assistance for PDF learning materials.

Students can upload a PDF and receive simplified learning support, including:

* Easy-to-understand summaries
* Important points
* Key concepts
* Exam-oriented questions
* Quick revision material

The goal is to help students understand lengthy study material more efficiently.

## Technology Stack

### Frontend

* React
* JavaScript
* Vite
* React Router
* HTML5
* CSS3

### Backend

* Node.js
* Express.js
* REST API

### Database

* MySQL

### AI

* Google Gemini API

### Development Tools

* Git
* GitHub
* Visual Studio Code
* npm

## System Overview

```text
                    Student Assistance
                           │
             ┌─────────────┴─────────────┐
             │                           │
          Student                     Teacher
             │                           │
      ┌──────┼──────┐             ┌──────┼──────┐
      │      │      │             │      │      │
 Classrooms Assignments       Classrooms Assignments
      │      │      │             │      │      │
      └──────┼──────┘             └──────┼──────┘
             │                           │
             └───────────┬───────────────┘
                         │
                    Node.js API
                         │
              ┌──────────┴──────────┐
              │                     │
            MySQL               Gemini AI
              │                     │
              └──────────┬──────────┘
                         │
                  Student Assistance
```

## Project Structure

```text
Student-Assistance/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* MySQL
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/shettynaman01-cyber/Student-Assistance.git
```

```bash
cd Student-Assistance
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

Open another terminal and run:

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `backend` folder and add the required configuration, including your Gemini API key and database settings.

**Do not commit your `.env` file to GitHub.**

### 5. Start the Backend

```bash
node server.js
```

### 6. Start the Frontend

Inside the `frontend` folder:

```bash
npm run dev
```

The application can then be accessed through the local Vite development server.

## Current Development Status

The project is actively being developed. Features are continuously being improved and new functionality is being added.

## Future Improvements

* Enhanced AI learning assistance
* Improved PDF analysis
* More personalized student recommendations
* Enhanced classroom collaboration
* Additional teacher tools
* Improved notifications and reminders
* More comprehensive academic analytics
* Improved responsive design

## Author

**Naman Shetty**

GitHub: [@shettynaman01-cyber](https://github.com/shettynaman01-cyber)

---

⭐ If you find this project interesting, feel free to explore the repository.
