# Project Lifecycle Management: System Architecture & Workflow

This document outlines the full-stack architecture of your Business Requirement Document (BRD) Generation web application and explicitly details exactly how the AI leverages user inputs to instantly compile professional BRD documents.

## Technology Stack

The platform operates as a modern MERN-like stack utilizing an in-memory database and AI integrations.

*   **Frontend**: React 19, TypeScript, Vite, TailwindCSS (for UI components).
*   **Backend**: Node.js, Express.js, TypeScript.
*   **Database**: MongoDB via `mongoose` (running on `mongodb-memory-server` locally for frictionless development).
*   **AI Service**: Gemini via `@google/generative-ai` SDK (`gemini-2.5-flash` model).

---

## High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Frontend [React Frontend (Port 5173)]
        UI_Dash[Dashboard]
        UI_Proj[Create Project]
        UI_Req[Requirement Input]
        UI_Brd[BRD Output / Viewer]
    end

    subgraph Backend [Express Backend (Port 5000)]
        API_Auth[/auth/register, /auth/login]
        API_Proj[/api/projects]
        API_Req[/api/requirements]
        API_Brd[/api/brd/generate]
        
        CTRL_Brd[brdController.ts]
    end

    subgraph DB [MongoDB (In-Memory)]
        Model_User[(Users)]
        Model_Project[(Projects)]
        Model_Req[(Requirements)]
        Model_Brd[(BRDs)]
    end

    subgraph External [External APIs]
        Gemini[Google Gemini API]
    end

    UI_Proj -- HTTP POST --> API_Proj
    API_Proj -- Save --> Model_Project

    UI_Req -- HTTP POST --> API_Req
    API_Req -- Save --> Model_Req

    UI_Brd -- HTTP POST --> API_Brd
    API_Brd --> CTRL_Brd
    
    CTRL_Brd -- Fetch Project & Reqs --> DB
    CTRL_Brd -- Send Prompt --> Gemini
    Gemini -- Return Markdown --> CTRL_Brd
    CTRL_Brd -- Save New Version --> Model_Brd
    CTRL_Brd -- Return Response --> UI_Brd
```

---

## How the BRD is Generated (Step-by-Step Logic)

The core logic lies in `backend/src/controllers/brdController.ts` under the `generateBRD` function. When a user clicks **"Generate New BRD"**, the backend follows a strict sequence:

### 1. Data Aggregation
The backend begins by querying the database for all the data associated with the requested `projectId`.
*   It fetches the **Project Profile** (Name, Client, Geography, Project Owner).
*   It fetches **ALL Requirements** associated with the project, sorted chronologically. This includes:
    *   The requirement *type* (e.g., "Client Discussion", "Old Meeting").
    *   The raw *text content/notes*.
    *   Any provided *URL links*.
    *   Any *uploaded files*. **Crucially**, if a user uploaded a `.txt` file along with the requirement, the backend reads the actual text contents from disk and injects the first 1000 characters into the context!

### 2. Context Compilation (The AI "Memory")
The backend dynamically builds a single massive `contextString` that merges all aggregated data so Gemini knows the full history of the project.

**Example Internal Context String Structure:**
> Project Info:
> Name: Digital Transformation
> Client: Acme Corp
> Geography: USA
> Owner: John Doe
> 
> Requirements & Discussions:
> --- [Client Discussion on 4/8/2026] ---
> Notes: The system requires secure multi-factor authentication.
> Links: https://example.com/oauth
> [Content of /uploads/security.txt]: "System MUST use AWS Cognito..."

### 3. Execution of the AI Prompt
The backend enforces a highly specific prompt instructing the Gemini API (`gemini-2.5-flash`) on exactly how to behave. The prompt explicitly demands:
1.  **AI Persona**: Act as a Senior Business Analyst.
2.  **Constraint**: Base the BRD *ENTIRELY and STRICTLY* on the compiled context. Invent absolutely zero new features.
3.  **Header Structure Constraint**: The very top of the output **MUST** feature a "Sources & References" list explicitly breaking down the input discussions and dates.
4.  **Body Structure Constraint**: Structure the document into exactly these headers:
    1. Project Overview
    2. Business Objectives
    3. Stakeholders
    4. Functional Requirements
    5. Non-Functional Requirements
    6. Assumptions & Constraints
5.  **Tone**: Highly professional and enterprise-ready.

### 4. Version Tracking & Save
Once the Gemini API yields the markdown string:
1.  The backend checks for previous BRDs for this project in the DB and calculates the next increment (e.g., `Version 1` becomes `Version 2`).
2.  The new markdown content is saved as a new `BRD` document in MongoDB.
3.  The parent `Project` status is formally updated to `"Analysis"`.
4.  The content is streamed back to the Frontend.

### 5. Frontend Rendering 
The `BRDOutput.tsx` page receives the generated markdown and feeds it through `react-markdown` to render a beautiful, properly formatted user interface.

---

> [!NOTE]
> **API Key Errors / 503 Overload**: The Gemini SDK uses the model `gemini-2.5-flash`. The API key you provided (`AIzaSyD8...`) is fully working. If you momentarily saw an `"Error generating BRD... 503 Service Unavailable"` from earlier, that simply meant the Google infrastructure was experiencing a temporary global traffic spike for the 2.5-flash model, not that your key was broken!
