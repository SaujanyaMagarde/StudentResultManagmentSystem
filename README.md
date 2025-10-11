# Student Result Management System

A full-stack web application for managing student results, built with React, Node.js, Express, and MySQL.

## Features

### Student Portal
- View results by roll number and class
- Comprehensive result cards with subject-wise marks
- Overall performance statistics

### Teacher Portal
- Secure login system
- Add/Update student results
- Class and subject-specific access control

### Admin Portal
- Register new teachers
- Assign classes and subjects to teachers

## Tech Stack

### Frontend
- React with Vite
- TailwindCSS for styling
- Lucide React for icons

### Backend
- Node.js & Express
- MySQL database
- JWT for authentication
- Bcrypt for password hashing

## Project Structure

```
├── backend/
│   ├── server.js              # Express server setup
│   ├── hash-password.js       # Password hashing utility
│   └── .env                   # Backend environment variables
├── Frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   └── main.jsx           # React entry point
│   └── index.html             # HTML template
└── database_schema.sql        # MySQL database schema
```

## Setup Instructions

### 1. Database Setup

```bash
mysql -u root -p < database_schema.sql
```

### 2. Backend Configuration

Create `backend/.env` with the following content:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=student_result_mgmt
PORT=5000
JWT_SECRET=your_secret_key
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd Frontend
npm install
```

### 4. Run the Application

```bash
# Start Backend (from backend directory)
cd backend
npm run dev

# Start Frontend (from Frontend directory, in a new terminal)
cd Frontend
npm run dev
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:5173` (Vite default).

## Database Schema

### Tables

- **classes**: Store class information
- **subjects**: Subject details with class associations
- **teachers**: Teacher profiles with authentication
- **students**: Student records with class assignments
- **results**: Student examination results

## API Endpoints

### Authentication

- `POST /api/teacher/login`: Teacher login
- `POST /api/teachers`: Register new teacher (Admin)

### Data Management

- `GET /api/students/class/:classId`: Get students by class
- `GET /api/results/student`: Get student results
- `POST /api/results`: Add/Update student results

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control
- Environment variable configuration

## Development

### Password Generation

Use the `hash-password.js` utility to generate hashed passwords for teachers:

```bash
node hash-password.js
```

### Development Features

- Frontend runs on Vite's development server with hot reload
- Backend uses nodemon for development auto-restart

## Production Deployment

1. **Build the frontend:**
   ```bash
   cd Frontend
   npm run build
   ```

2. **Configure production environment variables** in `backend/.env`

3. **Set up a production MySQL database**

4. **Deploy using your preferred hosting service** (e.g., Heroku, AWS, DigitalOcean, Vercel)

## Default Access

After setting up the database and running the application:

- **Admin/Teacher Login**: Use the credentials created via `hash-password.js`
- **Student Access**: No login required - access via roll number

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions, please open an issue in the GitHub repository.

---

**Note**: Make sure to replace placeholder values (like `your_password`, `your_secret_key`) with actual secure values before deploying to production.