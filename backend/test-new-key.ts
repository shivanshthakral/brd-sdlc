import { GoogleGenerativeAI } from '@google/generative-ai';

// Clean the key from user input
const key = 'AIzaSyAUSGzn3xKtQS-jD3tzVzHGmO7Lm9Uy2iQ';

async function listAndTest() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log("AVAILABLE MODELS FOR THIS KEY:");
    const models = data.models.map((m: any) => m.name);
    console.log(models);

    // Let's test the primary models one by one
    const genAI = new GoogleGenerativeAI(key);
    
    // Fallback order: try the most reliable models
    const modelsToTest = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-2.5-flash", "gemini-pro"];
    
    for (const modelName of modelsToTest) {
      try {
        console.log(`\nTesting generation on: ${modelName} ...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Test connection");
        console.log(`SUCCESS on ${modelName} -> Response:`, result.response.text());
        
        // Write the truly working model and key to a file so we know for sure
        require('fs').writeFileSync('working-config.json', JSON.stringify({ key, model: modelName }));
        console.log(`Saved working configuration: key=${key}, model=${modelName}`);
        return; // exit on first success
      } catch (err: any) {
        console.error(`FAILED on ${modelName}:`, err.message);
      }
    }
    
    console.log("NONE OF THE STANDARD MODELS WORKED!");
  } catch (err: any) {
    console.error("Error fetching models:", err);
  }
}

listAndTest();
