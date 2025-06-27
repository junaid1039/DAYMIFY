

📄 Backend Environment Configuration

Before running the backend server, ensure that you create a `.env` file in the root directory of your project and add the following environment variables:

🔧 Server Configuration

env
PORT=5000
The port on which the backend server will run.

💾 Database Configuration

env
MONGO_URL=your_mongodb_connection_string
Replace `your_mongodb_connection_string` with your actual MongoDB connection URL.

🔐 Authentication Configuration

env
SECRET_KEY=your_secret_key
JWT_EXPIRE=your_token_expiry_time (optional)
ROLE=Admin
`SECRET_KEY`: Used to generate and verify JWT tokens.
`JWT_EXPIRE` *(Optional)*: Duration after which JWT tokens expire (e.g., `1d`, `2h`, etc.).
`ROLE`: Default user role (e.g., `Admin`, `User`).

☁️ Cloudinary Configuration

env
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

Add your Cloudinary account details here to enable image upload and management.

Note: Never share your `.env` file or commit it to version control. Use `.gitignore` to keep it private.
