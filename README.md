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
- Users can sign up for an account using a username and password or externally using Google.
- Logging in will provide users with more options for their exam creation (see 5.).
- You can edit or delete your account later.

## **Instructions for Use**

### **Accessing the Application**
To use the application, follow these steps, check [here](https://drive.google.com/file/d/1kbOCG3lf2pBAF-ax205SkVKt4xkynw1y/view?usp=drivesdk) for a quick video demo going over the core features:

1. **Go to** [https://avgr.vercel.app/](https://avgr.vercel.app/)
2. Click on the **"Try Now"** button.
3. Alternatively, use the top navbar to quickly use any of our features.

### **Using the Application**
1. **Upload a Sample Exam**  
   - Select a PDF document to extract questions from. Currently, we support math problems up to university-level calculus, for examples check the `/examples` directory.
   - Choose how many questions you would like to generate (between 1-10).
   - Optionally, provide a **title** and **description** for the exam.

2. **Generate Exam Questions**  
   - Click on the generate button and wait for the system to process the exam.
   - You will get live updates during the exam generation process, do not refresh the tab.
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

7. **Account Management**
   - Once logged in, you can modify your account details such as your username and password (password modification not supported for Google accounts):
     - Navigate to your **Profile** page by clicking on your username in the top-right corner, or in the drop-down menu on mobile.
   - Account deletion is available through the "Delete Account" button at the bottom of the profile page.

### Content Guidelines

Our application supports the uploading of unrelated PDFs instead of math exams during the generation process; doing so will include assorted questions on the theme of the document uploaded. However, blank documents will not be considered for generation.

In the case of inappropriate content, the extractor will flag any documents uploaded, preventing any questions from being extracted from the document.

### Example Tests

Inside the `/examples` directory, you can find various example tests covering different subjects and question types, these range from high school level arithmetic and algebra to multivariate calculus and statistics. These are meant for you to try out the application's capabilities and understand how different types of math problems are handled.

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
│   │   ├── tests/            # Backend test files
│   │   │   ├── database/     # Database-specific tests
│   │   │   └── example_pdfs/ # Test PDF files
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
│   ├── Dockerfile          # Docker configuration
│   └── supervisord.conf    # Supervisor configuration
├── docker-compose.yml      # Docker compose configuration
├── examples/                # Example math problems for testing
├── deliverables/           # Project deliverables
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
  - `database/`: Contains the database interface, schemas and implementations
  - `tests/`: Contains backend test files
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

#### **Extending the System**
The application is designed with extensibility in mind through well-defined interfaces:

1. **Adding New Database Implementations**
   - Implement the `DataAccessObject` interface from `app/backend/database/__init__.py`
   - Follow the pattern in `app/backend/database/sqlitedb.py` or `app/backend/database/postgresdb.py`
   - Register your implementation in `app/backend/database/db_factory.py`

2. **Adding New LLM Providers**
   - Extend the `ModelProvider` class in `app/backend/models.py`
   - Implement the `call_model` method with your provider's API
   - See examples in the existing `GeminiModel` and `Cohere` classes

3. **PDF Processing Extensions**
   - The `PDFObject` class in `app/backend/PdfScanner/pdfobject.py` defines the interface for PDF content
   - You can extend extraction capabilities by modifying the scanner while maintaining this interface

4. **API Routes and Endpoints**
   - New API routes can be added to `app/backend/app.py` by following the existing patterns
   - For authenticated routes, use the `@token_required` decorator to ensure proper authentication
   - Group related endpoints together and maintain consistent error handling patterns:
     ```python
     @app.route('/api/your-feature', methods=['POST'])
     @token_required  # If authentication middleware is required
     def your_endpoint(current_user):  # current_user is injected by the decorator
         # Extract data from request
         data = request.get_json()
         
         # Validate required fields
         if not all(field in data for field in ["required_field"]):
             return jsonify({'message': 'Missing required fields'}), 400
             
         # Process the request using database or other services
         # ...
         
         return jsonify({'result': 'success'}), 200
     ```

5. **Customizing LLM Models for Exam Generation**
   - The exam generation pipeline in `app/backend/task.py` uses two model providers:
     ```python
     # To change models, modify these lines in _generate_exam_core
     pdf_model = GeminiModel()  # Used for PDF processing
     text_model = Cohere('command-a-03-2025')  # Used for text generation
     ```
   - To change the model providers or specific models:
     - For PDF processing: Replace `GeminiModel()` with your custom implementation
     - For text generation: Replace `Cohere('command-a-03-2025')` with another provider or model
     - You can also adjust parameters like temperature or max tokens by passing them to the constructor
   - For question and answer generation, modify the calls to:
     ```python
     # Example: Adding model parameters
     generated_questions = await questionGenerator.generate_questions(
         exam_questions,
         num_questions_to_generate,
         text_model,
         temperature=0.7  # Add custom parameters
     )
     ```

6. **Frontend Extensions and Customization**
   - **Components Organization**:
     - Add reusable UI components to `app/frontend/components/`
     - Place layout components in `app/frontend/components/layout/` - these control the overall page structure
     - Follow TypeScript best practices by declaring prop types for all components:
       ```tsx
       // Example component with type declarations
       type ButtonProps = {
         text: string;
         onClick: () => void;
         variant?: 'primary' | 'secondary';
       };
       
       const Button: React.FC<ButtonProps> = ({ text, onClick, variant = 'primary' }) => {
         return (
           <button 
             className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'}`}
             onClick={onClick}
           >
             {text}
           </button>
         );
       };
       
       export default Button;
       ```

   - **Creating New Pages/Routes**:
     - Add new pages in the `app/frontend/pages/` directory - each file automatically becomes a route
     - Use dynamic routes with file names like `[id].tsx` or `[slug].tsx` for parameter-based routing:
       ```tsx
       // pages/exam/[id].tsx - Creates a route like /exam/123
       import { useRouter } from 'next/router';
       
       const ExamPage: React.FC = () => {
         const router = useRouter();
         const { id } = router.query; // Access the dynamic parameter
         
         return <div>Exam ID: {id}</div>;
       };
       
       export default ExamPage;
       ```
     - Create API routes in `app/frontend/pages/api/` following the same file-based routing pattern

   - **Utility Functions**:
     - Add helper functions to `app/frontend/utils/` for code reuse across components
     - Group related utilities in separate files (e.g., `formatting.ts`, `validation.ts`)
     - Export named functions with type definitions:
       ```typescript
       // utils/formatting.ts
       export const formatDate = (date: string | Date): string => {
         const d = new Date(date);
         return d.toLocaleDateString('en-US', { 
           year: 'numeric', 
           month: 'long', 
           day: 'numeric' 
         });
       };
       ```

   - **State Management**:
     - Global state is managed in `app/frontend/store/` using Zustand
     - Use global state sparingly - prefer component state for UI-specific logic
     - Create specialized stores for distinct features:
       ```typescript
       // store/examStore.ts
       import create from 'zustand';
       
       type Exam = {
         id: number;
         title: string;
         // other properties
       };
       
       type ExamStore = {
         exams: Exam[];
         currentExam: Exam | null;
         setCurrentExam: (exam: Exam) => void;
         fetchExams: () => Promise<void>;
       };
       
       export const useExamStore = create<ExamStore>((set) => ({
         exams: [],
         currentExam: null,
         setCurrentExam: (exam) => set({ currentExam: exam }),
         fetchExams: async () => {
           // Fetch exams and update state
           const response = await fetch('/api/exams');
           const exams = await response.json();
           set({ exams });
         }
       }));
       ```

   - **Authentication Customization**:
     - The authentication system uses NextAuth.js configured in `app/frontend/pages/api/auth/[...nextauth].js`
     - To customize authentication:
       - Modify the providers array to add/remove authentication methods
       - Adjust callbacks for custom session handling or JWT token management
       - Example to add a new provider:
         ```javascript
         // pages/api/auth/[...nextauth].js
         import NextAuth from 'next-auth';
         import GoogleProvider from 'next-auth/providers/google';
         import GithubProvider from 'next-auth/providers/github'; // Adding GitHub

         export default NextAuth({
           providers: [
             GoogleProvider({
               clientId: process.env.GOOGLE_CLIENT_ID,
               clientSecret: process.env.GOOGLE_CLIENT_SECRET,
             }),
             GithubProvider({
               clientId: process.env.GITHUB_ID,
               clientSecret: process.env.GITHUB_SECRET,
             }),
           ],
           // Other configuration options
         });
         ```
       - For custom backend integration, modify the callbacks section to handle token and session management

Each interface is thoroughly documented with docstrings explaining the expected behavior and parameter requirements.

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
- You need to create a Gemini API key on the Google Cloud Console.
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

- Question Extractor (`test_extractor.py`) - Tests PDF extraction functionality
- Extracted Question Validator (`test_extractorvalidator.py`) - Tests validation of extracted content 
- Question Generation (`test_questionGenerator.py`) - Tests LLM-based question generation
- Answer Generation (`test_answerGenerator.py`) - Tests answer generation and verification
- Answer Validator (`test_validation.py`) - Tests answer validation algorithms and confidence scoring
- LLM Models (`test_models.py`) - Tests Cohere and Gemini API integrations with proper error handling
- Exam Management (`test_exam.py`) - Tests exam data structure, question/answer storage, and confidence scoring

The test suite uses example PDFs in the `tests/example_pdfs/` directory to simulate real-world usage scenarios and verify system components work correctly both individually and together.

#### Database Tests
Database tests are located in `app/backend/tests/database/`. Database tests cover the correctness of all database functions, and ensure data constraints are met when performing operations. No performance tests are provided.

Tests are performed using the database interface without directly interacting with the underlying implementation to ensure that the interface functions correctly and to reduce repetition of tests per implementation. The concrete
tests themselves are written in an abstract test suite `base_test_dao.py` using the database interface `DataAccessObject`. Abstract helper functions that interact with the database implementation without the interface are also provided. 
These tests are then implemented by the database to be tested in their respective test suite (`test_sqlitedb.py` and `test_postgresdb.py`), which provide the actual tests to be run during testing. 

For PostgreSQL tests, the TEST_DATABASE_URL environment variable must be set. To run database tests specifically:
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
- Start all services and make them available at the configured URLs

The application should be accessible at the following URLs (ensure the environment variables are consistent):
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

To stop the deployment:
```sh
docker compose down
```

#### Production Deployment
For production deployment, you need to ensure that environment variables are properly set on the respective platforms:

1. **DigitalOcean** (Backend): 
   - All environment variables from the `.env` file must be configured in your DigitalOcean App Platform settings
   - This includes `COHERE_API_KEY`, `GEMINI_API_KEY`, `SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`
   - DigitalOcean automatically sets environment variables for services it manages (like database connections)

2. **Vercel** (Frontend):
   - All environment variables from the `.env.local` file must be configured in your Vercel project settings
   - This includes `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_BACKEND_URL`
   - Make sure `NEXT_PUBLIC_BACKEND_URL` points to your production backend on DigitalOcean
   - Set `NEXTAUTH_URL` and `NEXT_PUBLIC_URL` to your Vercel deployment URL

When properly configured, the CircleCI pipeline will automatically deploy changes to both platforms when PRs are merged to the main branch.

### Common Issues

#### Port Conflicts
- **localhost:5000 isn't available on macOS**: This is due to AirPlay Receiver using the same port. You can either:
  - Turn off AirPlay Receiver in System Preferences → Sharing
  - Change the backend port in `docker-compose.yml` and update the corresponding environment variables

#### Authentication Issues
- **Auth features don't work in local development**: Try unsetting the following environment variables:
  ```sh
  unset NEXT_PUBLIC_BACKEND_URL
  unset NEXT_PUBLIC_URL
  unset NEXTAUTH_URL_INTERNAL
  unset BACKEND_URL
  ```
  Then restart your development servers.

### CI/CD
Our project uses CircleCI for continuous integration and deployment with three primary configuration files:

0. **Pre-commit Hooks**: We use pre-commit hooks to ensure consistent coding conventions, with tools like `black` for Python code formatting.

1. **Automated Testing** (`.circleci/tests.yml`):
   - Frontend testing with Jest - Tests all React components and page functionality
   - Backend testing with Pytest - Tests all core functionality: extraction, validation, generation, and database operations
   - Tests run automatically when a PR is opened or updated

2. **Backend Deployment** (`.circleci/backend.yml`):
   - Builds Docker image for the backend
   - Pushes to DigitalOcean Container Registry
   - Tags images with commit SHA for versioning

3. **Frontend Deployment** (`.circleci/frontend.yml`):
   - Syncs frontend code to a production repository
   - Excludes test files from the production build
   - Triggers Vercel deployment through GitHub integration

#### CircleCI Configuration
To set up CircleCI for this project, you need to configure the following environment variables in the CircleCI project settings:

1. **API Keys**:
   - `COHERE_API_KEY` - API key for Cohere services
   - `GEMINI_API_KEY` - API key for Google's Gemini AI

2. **DigitalOcean Configuration**:
   - `DIGITALOCEAN_API_TOKEN` - For authenticating with DigitalOcean services
   - `DIGITALOCEAN_EMAIL` - Email associated with the DigitalOcean account
   - `DIGITALOCEAN_REGISTRY_NAME` - Name of the container registry

3. **GitHub Integration**:
   - `FRONTEND_FORK_REPO` - Git URL for the frontend deployment repository
   - `GITHUB_EMAIL` - Email for Git operations
   - `GITHUB_USERNAME` - Username for Git operations

4. **Testing**:
   - `TEST_DATABASE_URL` - Database URL for running tests

5. **SSH Keys**:
   - Add an SSH key with access to the GitHub repositories in the CircleCI project settings

These environment variables enable the CI/CD pipeline to authenticate with various services, run tests, and deploy the application automatically.

## GitHub Workflow

 **1. Branching and Development**
- Each team member works on a separate feature branch based on `main`.
- Before starting work, they pull the latest changes to stay up to date.
- Changes are committed and pushed to their respective feature branches.
- As changes are committed, pre-commit hooks are triggered to ensure consistent style conventions.

 **2. Pull Requests (PRs) and Code Reviews**
- After completing a feature, the developer opens a Pull Request (PR) on GitHub.
- A team member from the same subteam reviews the code, suggests improvements, and requests changes if needed.
- Reviewers focus on code quality, test coverage, and alignment with requirements.

 **3. Automated Tests on PRs**
- Every time a PR is opened or updated, CircleCI automatically runs all tests.
- Tests **must pass** before the PR can be approved and merged.
- In rare cases where tests are failing for valid reasons (e.g., known limitations in the test environment), the PR can be approved and merged at the reviewer's discretion.
- Test results are visible directly in the PR interface.

 **4. Merging and Deployment**
- After approval, the PR is merged into `main`.
- This triggers the deployment pipeline:
  - Backend: Docker image is built and pushed to DigitalOcean, where it's automatically deployed on DigitalOcean
  - Frontend: Code is synced to our production repository, triggering Vercel to build and deploy the frontend application
- Developers then pull the latest changes to stay updated.
- The entire process from merge to production deployment typically takes less than 5 minutes.

## **License: MIT**

**Why MIT?**

This application is designed to **help users generate, browse, and customize exams** efficiently.  
By using the MIT License, we ensure that:
- Educators and institutions can use and modify the tool without legal barriers.
- Developers can contribute to improving the app without restrictive licensing terms.
- Open-source adoption remains strong, allowing continued growth and enhancement.



