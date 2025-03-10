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
   - Choose how many questions you would like to generate (between 1-10).
   - Optionally, provide a **title** and **description** for the exam.

2. **Generate Exam Questions**  
   - Click on the generate button and wait for the system to process the exam.
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
    
## **Developer Instructions**
### **Setting Up the Project Locally**
#### **Prerequisites**
- **Node.js 18+** (for frontend development)
- **Python 3.11+** (for backend API)

#### **Installation Steps**
1. **Clone the repository:**
   ```sh
   git clone https://github.com/csc301-2025-s/project-27-the-avengers.git
   cd project-27-the-avengers
   ```
2. Ensure you have `poetry` installed. If you do, proceed to the next step. If not:
- Run `pip install --user poetry==1.8.3`.
- Add the following to your `~/.zshrc` by running `nano ~/.zshrc` and then adding `export PATH="$HOME/.local/bin:$PATH"` to the file.
- Run `source ~/.zshrc`.

    
2. **Install Backend Dependencies and start backend server:**
   ```sh
   cd app
   poetry install
   poetry run python -m backend.app
   ```

4. **Install Frontend Dependencies and start the frontend server:**
   On a separate terminal at the root directory
   ```sh
   cd app/frontend
   npm install
   npm run dev
   ```


### **Environment Variables Configuration**
Ensure to add a `.env` file in the root directory with the following variables:
```
COHERE_API_KEY=your_cohere_api_key
GEMINI_API_KEY=your_gemini_key
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
SECRET_KEY=
DATABASE_URL=
DB_MODE=postgres
```
- You can create a trial Cohere API key (for free) [here](https://dashboard.cohere.com/api-keys).
- You will need to set up a serverless Redis service and fill in the Redis related environment variables.
- You will need to set up a Postgres database with the schema defined in `app/backend/database/postgres_schema.sql`.
- You need to define a secret key used for hashing the password.
  
Additionally, you will need a `.env.local` file in the app/frontend directory with the following variables:
```
NEXTAUTH_URL=localhost:3000
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_BACKEND_URL=
NEXT_PUBLIC_OTHER_BACKEND_URL=
REDIS_URL=
```
- The backend URLs should just be where you are running the backend server, typically this is `localhost:5000`.
- Again, you will need to set up Redis like in the backend.
- You need to set up OAuth 2.0 through Google, you can check [here](https://developers.google.com/identity/protocols/oauth2) for details.


### Tests
For frontend testing, we utilize the Jest framework, we can test components individually through unit tests, checking the expected behaviour of various UI features (e.g., expanding and collapsing the sidebar)
Additionally, we have created some integration tests to ensure that the routing is correct. Our current test (line) coverage is 90%. To run the tests locally, following the installation steps and run:
```sh
npx jest
```

We utilize the Pytest python framework for our automated testing in the backend. 

Currently we only have test coverage across our `validator` module, however we plan on expanding our coverage to the other modules that rely on API calls to ensure stability.

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



