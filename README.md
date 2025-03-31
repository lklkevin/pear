# **LLM-Based Math Practice Problem Generator**

## **Introduction**
The LLM-Based Math Practice Problem Generator is a web service designed to help students generate additional math practice problems with verified final answers. By uploading a document containing math problems (e.g., past exams, homework sheets, lecture slides), students can generate a completely new set of similar problems to aid their learning and exam preparation.

### **Problem Statement**
Students often face a shortage of practice material, especially when preparing for exams. Searching the internet for relevant problems is time-consuming, and existing AI tools may generate incorrect answers due to hallucinations. This tool provides reliable practice problems with accurate final answers, leveraging test-time scaling and majority voting techniques to ensure correctness.

### **Key Features**
- **PDF Upload**
- **Question Generation**
- **Final Answer Validation**
- **Confidence Metrics**
- **PDF Export**
- **Saving Exam**
- **Browsing Exams**
- **Favouriting Exams**
- **Account Signup/Login**
- **Cloud-Based Deployment**

## **Feature Description**
### **1. Uploading a Document**
- Users upload a PDF containing math problems.
- The system extracts text and identifies math-related content.

### **2. Generating Practice Questions**
- The AI model generates a set of new practice problems based on the uploaded content.
- Users can view and interact with the generated questions.

### **3. Viewing Answers and Confidence Scores**
- The system provides final answers along with confidence metrics.
- Users can compare multiple answer choices and verify correctness.

### **4. Exporting to PDF**
- Users can download the generated problems and answers in a structured PDF format.
- Ensures a clean and printable format for exam preparation.

### **5. Saving Exams (Account Bearers Only)**
- Users can choose to save their exams to a database for access later.
- Users can choose a public privacy option, which would allow other users to view the exam's content, or keep it private

### **6. Browsing Exams**
- Users can search for public exams.
- Users can view popular and their own exams.

### **7. Favouriting Exams**
- Users can favourite an exam and view it later under a favourite tab.

### **8. Account creation**
- Users can sign up for an account using a username or password or externally using Google.
- Logining in will provide users with more options for their exam creation (see 5.)

## **Instructions for Use**

### **Accessing the Application**
To use the application, follow these steps:

1. **Go to** [https://avgr.vercel.app/](https://avgr.vercel.app/)
2. Click on the **"Try Now"** button.
3. Alternatively, use the top navbar to quickly use any of our features.

### **Using the Application**
1. **Upload a Sample Exam**  
   - Select a PDF document to extract questions from. Currently, we only support Math problems up to high school level, for examples download the example file [here](https://github.com/csc301-2025-s/project-27-the-avengers/blob/main/app/frontend/public/math_12.pdf)
   - Choose how many questions you would like to generate (between 1-5).
   - Optionally, provide a **title** and **description** for the exam.

2. **Generate Exam Questions**  
   - Click on the generate button and wait for the system to process the exam.
   - Due to free-tier deployment constraints, you may get an error due to timeout, please try again after logging in if this occurs.
   - Do not refresh the page, this process will take 1-2 minutes depending on the number of questions.

3. **View Results**  
   - The generated questions and available answers will be displayed.
   - You can reveal answers for each question, or for all questions simultaneously, and see alternative answers with respective confidence levels.

4. **Download the Exam**  
   - Click on the download option to save the exam for offline use.

5. **Browse Other Exams**  
   - Visit the **Browse** page to explore previously generated exams by other users.
   - You can sort by popularity (number of favourites), or explore (recency).
   - You can search by the title to find exams similar to your needs.

6. **Sign Up / Log In (Optional)**  
   - Create an account to:
     - **Save** generated exams, either as public or private.
     - **Favourite** exams to easily access them later in the browse tab. 
     - Unlock **customization** options for better organization.
   - You can create an account using username, email, and password, or simply use your Google account.
    
### Content Guidelines

Our application supports the uploading of unrelated PDFs instead of math exams during the generation process; doing so will include assorted questions on the theme of the document uploaded. However, blank documents will not be considered for generation.

In the case of inappropriate content, the extractor will flag any documents uploaded, preventing any questions from being extracted from the document.

### Example Tests

Inside the `/examples` directory, you can find various example tests covering different subjects and question types, these range from high school level arithmetic and algebra to multivariate calculus and statistics. These are meant for you to try out the application's capabilities and understand how different types of math problems are handled.

#### Available Example Tests
- **Basic Arithmetic**: Simple addition, subtraction, multiplication, and division problems
- **Algebra**: Linear equations, quadratic equations, and polynomial expressions
- **Geometry**: Area, perimeter, and volume calculations
- **Trigonometry**: Trigonometric functions, identities, and applications
- **Calculus**: Derivatives, integrals, and limits in single variable and multivariable settings
- **Statistics**: Probability, data analysis, and statistical measures

#### How to Use Example Tests
1. Navigate to the `/examples` directory
2. Choose a test file that matches your area of interest
3. Upload the PDF to the application
4. Generate new practice problems based on the example test
5. Compare the generated questions with the original to understand the system's capabilities

These example tests serve as both demonstration materials and templates for users to understand the types of content that work best with our system. They are particularly useful for:
- Testing the system's question generation capabilities
- Understanding the format of supported math problems
- Verifying the accuracy of generated answers
- Learning how to structure your own math problems for optimal results

## **Developer Instructions**
### **Setting Up the Project Locally**
#### **Prerequisites**
- **Node.js 18+** (for frontend development)
- **Python 3.11+** (for backend API)

#### **Repository Structure**
```
project-27-the-avengers/
├── .circleci/                 # CircleCI configuration for CI/CD
│   ├── backend.yml           # Backend CI configuration
│   ├── frontend.yml          # Frontend CI configuration
│   └── tests.yml             # Test CI configuration
├── app/
│   ├── .env                   # Backend environment variables
│   ├── backend/               # Backend components
│   │   ├── app.py            # Main Flask application and API endpoints
│   │   ├── task.py           # Celery tasks for background processing
│   │   ├── database/         # Database schemas and migrations
│   │   └── PdfScanner/       # PDF processing and text extraction
│   ├── frontend/             # Frontend Next.js application
│   │   ├── components/       # Reusable React components
│   │   ├── pages/           # Next.js pages and routing
│   │   ├── store/           # State management (Zustand)
│   │   ├── utils/           # Helper functions and utilities
│   │   ├── public/          # Static assets and example files
│   │   └── .env.local       # Frontend environment variables
│   ├── requirements.txt     # Python dependencies for pip installation
│   ├── pyproject.toml       # Poetry project configuration
│   ├── poetry.lock         # Poetry dependency lock file
│   ├── Dockerfile          # Docker configuration
│   └── supervisord.conf    # Supervisor configuration
├── docker-compose.yml      # Docker compose configuration
├── examples/                # Example math problems for testing
├── deliverables/           # Project deliverables
├── team/                   # Team documentation
├── .pre-commit-config.yaml # Pre-commit hooks configuration
├── .gitignore             # Git ignore rules
└── README.md
```

#### **Directory Details**
- **.circleci/**
  - Contains CircleCI configuration for continuous integration and deployment
  - `backend.yml`: Backend-specific CI configuration
  - `frontend.yml`: Frontend-specific CI configuration
  - `tests.yml`: Test suite CI configuration

- **app/**
  - Main application directory containing both frontend and backend
  - Contains Docker and deployment configurations
  - `pyproject.toml` and `poetry.lock`: Poetry dependency management
  - `Dockerfile`: Containerization setup
  - `supervisord.conf`: Process management configuration

- **backend/**
  - Contains the Flask API server and Celery worker
  - `app.py`: Main application file with API routes and core logic
  - `task.py`: Background task definitions for question generation
  - `database/`: Contains database schemas and migration scripts
  - `PdfScanner/`: PDF processing and text extraction module

- **frontend/**
  - Next.js application with React components
  - `components/`: Reusable UI components (buttons, forms, etc.)
  - `pages/`: Next.js pages and API routes
  - `store/`: State management for user data and application state
  - `utils/`: Helper functions, API calls, and common utilities
  - `public/`: Static assets including example math problems

- **examples/**
  - Sample math problems in PDF format
  - Useful for testing the question generation system
  - New developers should add their own examples here

#### **Configuration Files**
- `.env` (app/)
  - Backend configuration including API keys and database settings
  - Required for running the backend server
  - See Environment Variables section for required values

- `.env.local` (app/frontend/)
  - Frontend configuration including authentication and API endpoints
  - Required for running the frontend development server
  - See Environment Variables section for required values

#### **Installation Steps**
1. **Clone the repository:**
   ```sh
   git clone https://github.com/csc301-2025-s/project-27-the-avengers.git
   cd project-27-the-avengers
   ```

2. **Backend Setup**
   
   Option 1 - Using Poetry (Recommended):
   ```sh
   cd app
   # If poetry is not installed:
   pip install --user poetry==1.8.3
   # Add to ~/.zshrc: export PATH="$HOME/.local/bin:$PATH"
   # Then run: source ~/.zshrc
   
   poetry install
   poetry run python -m backend.app
   ```

   Option 2 - Using pip:
   ```sh
   cd app
   pip install -r requirements.txt
   python3 -m backend.app
   ```

   To run Celery worker (for background tasks in exam generation):
   ```sh
   celery -A backend.task worker
   ```

3. **Frontend Setup**
   ```sh
   cd app/frontend
   npm install
   npm run dev
   ```

### **Environment Variables Configuration**
Ensure to add a `.env` file in the `app/` directory with the following variables:
```
# Required
COHERE_API_KEY=your_cohere_api_key
GEMINI_API_KEY=your_gemini_key
SECRET_KEY=your_secret_key
DATABASE_URL=your_postgres_database_url
REDIS_URL=your_redis_url

# Optional
TEST_DATABASE_URL=your_test_database_url  # Only if running database tests locally
LOG_LEVEL=WARNING                         # For debug logging, defaults to DEBUG if not set
DB_MODE=postgres                         # Use 'sqlite' for SQLite database, defaults to 'postgres'
FLASK_ENV=development                    # May resolve SSL issues in development environment
```
- You can create a trial Cohere API key (for free) [here](https://dashboard.cohere.com/api-keys).
- You need to create a Gemini API key on the Google cloud console.
- You will need to set up a Redis service and fill in the Redis URL.
- You will need to set up a Postgres database with the schema defined in `app/backend/database/postgres_schema.sql`.
- Generate a secure secret key for password hashing.
  
Additionally, you will need a `.env.local` file in the `app/frontend/` directory with the following variables:
```
# Required
NEXTAUTH_URL=http://localhost:3000        # Must match NEXT_PUBLIC_URL
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_BACKEND_URL=your_backend_url
NEXT_PUBLIC_URL=http://localhost:3000     # Must match NEXTAUTH_URL

# Optional (must only include for Docker Compose)
# NEXTAUTH_URL_INTERNAL=http://frontend:3000
# BACKEND_URL=http://backend:5000
```
- Set up OAuth 2.0 through Google, you can check [here](https://developers.google.com/identity/protocols/oauth2) for details.
- The backend URL should point to your backend server (e.g., `https://your-backend-url/` for production or `http://localhost:5000` for local development).
- For production deployment, update both `NEXTAUTH_URL` and `NEXT_PUBLIC_URL` to your deployed URL.

### Tests
For frontend testing, we utilize the Jest framework. We test components individually through unit tests, checking the expected behavior of various UI features (e.g., expanding and collapsing the sidebar).
Additionally, we have created integration tests to ensure that the routing is correct. Our current test coverage is 90%. 

#### Frontend Tests
- Test files are located in `__tests__` directories within component directories (e.g., `app/frontend/components/auth/__tests__/`)
- Files follow the naming convention `*.test.tsx` 
- To run frontend tests locally:
  ```sh
  cd app/frontend
  npx jest
  ```

#### Backend Tests
- Test files are located in the `app/backend/tests` directory
- Files follow the naming convention `test_*.py`
- To run backend tests locally:
  ```sh
  # Option 1: Using pytest directly (in app directory)
  cd app
  pytest
  
  # Option 2: Using Poetry
  cd app
  poetry run pytest
  ```

We have automated test coverage across our entire pipeline to ensure functionality after any changes. This includes the modules that rely on API calls to ensure stability.

Our backend testing covers the following aspects:

- Question Extractor (`test_extractor.py`)
- Extracted Question Validator (`test_extractorvalidator.py`)
- Question Generation (`test_questionGenerator.py`)
- Answer Generation (`test_answerGenerator.py`)
- Answer Validator (`test_validation.py`)

#### Database Tests
- Database tests are located in `app/backend/tests/database/`
- Both SQLite and PostgreSQL implementations are tested (`test_sqlitedb.py` and `test_postgresdb.py`)
- Database tests require the TEST_DATABASE_URL environment variable to be set for PostgreSQL tests
- To run database tests specifically:
  ```sh
  cd app
  pytest backend/tests/database/
  ```

### Deployment

#### Local Deployment with Docker Compose
After setting up the environment variables in both `.env` and `.env.local` files, you can deploy the entire application locally using Docker Compose:

```sh
# From the root directory
docker compose up
```

This will:
- Build all necessary containers for the backend and frontend
- Set up the network between services
- Mount volumes for development
- Start all services and make them available at the configured URLs

The application should be accessible at, you can configure this as required, ensure the environment variables are consistent:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

To stop the deployment:
```sh
docker compose down
```

### CI/CD
1. We are using various pre-commit hooks to ensure consistent coding conventions and formatting such as ```black```.
2. We run automated testing when a PR is merged using ```GitHub Actions``` to ensure correct functionality.

## GitHub Workflow

 **1. Branching and Development**
- Each team member works on a separate feature branch based on `main`.
- Before starting work, they pull the latest changes to stay up to date.
- Changes are committed and pushed to their respective feature branches.
- As changes are committed, pre-commit hooks are triggered to ensure consistent style conventions.

 **2. Pull Requests (PRs) and Code Reviews**
- After completing a feature, the developer opens a Pull Request (PR) on GitHub.
- Other team members review the code, suggest improvements, and request changes if needed.

 **3. Automated Tests on PRs**
- Continuous Integration (CI) runs automated tests on each PR.
- If tests fail, the developer must fix issues before merging.
- If tests pass, the PR can be approved and merged.

 **4. Merging and Deployment**
- After approval, the PR is merged into `main`.
- A deployment pipeline automatically deploys the changes.
- Developers then pull the latest changes to stay updated.

## **License: MIT**

**Why MIT?**

This application is designed to **help users generate, browse, and customize exams** efficiently.  
By using the MIT License, we ensure that:
- Educators and institutions can use and modify the tool without legal barriers.
- Developers can contribute to improving the app without restrictive licensing terms.
- Open-source adoption remains strong, allowing continued growth and enhancement.



