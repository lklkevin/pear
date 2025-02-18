# **LLM-Based Math Practice Problem Generator**

## **Introduction**
The LLM-Based Math Practice Problem Generator is a web service designed to help students generate additional math practice problems with verified final answers. By uploading a document containing math problems (e.g., past exams, homework sheets, lecture slides), students can generate a completely new set of similar problems to aid their learning and exam preparation.

### **Problem Statement**
Students often face a shortage of practice material, especially when preparing for exams. Searching the internet for relevant problems is time-consuming, and existing AI tools may generate incorrect answers due to hallucinations. This tool provides reliable practice problems with accurate final answers, leveraging test-time scaling and majority voting techniques to ensure correctness.

### **Key Features**
- **PDF Upload**: Users can upload PDFs containing math problems.
- **Question Generation**: AI models generate new, relevant practice questions.
- **Final Answer Validation**: Uses test-time scaling and majority voting to improve answer reliability.
- **Confidence Metrics**: Provides confidence scores for generated answers.
- **PDF Export**: Users can export generated questions into a structured PDF format for exam simulation.
- **Cloud-Based Deployment**: Accessible via a web interface without requiring additional installations.

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


## **Beta Usage (Testing Only)**

### **Demo of Problem/Final Answer Generation Pipeline**
1. Navigate to this streamlit deployment: https://subteam-deployment-dklckspcc565nsvcvnpbmp.streamlit.app/ 

2. Follow the instructions from the script, you do not need to worry about an API key or dependancies.

3. The scope of our exams at the moment is limited to high school level math questions with simple final answers. If you want example questions you can find some we personally tested with in the ./app/backend/tests/example questions


### **Demo of PDF Extraction**


### **Demo of Front End**


## **Developer Instructions**
### **Setting Up the Project Locally**
#### **Prerequisites**
- **Node.js** (for frontend development)
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

    
2. **Install Backend Dependencies:**
   ```sh
   cd app/backend
   poetry install
   ```

4. **Install Frontend Dependencies:**
   ```sh
   cd ../frontend
   npm install
   ```
5. **Start Frontend Server:**
   ```sh
   npm run dev
   ```


### **Environment Variables Configuration**
Ensure to add a `.env` file in the root directory with the following variables:
```
COHERE_API_KEY=your_cohere_api_key
GEMINI_API_KEY=your_gemini_key
```
You can create a trial Cohere API key (for free) [here](https://dashboard.cohere.com/api-keys)
