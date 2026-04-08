import { GoogleGenerativeAI } from '@google/generative-ai';

const key = 'AIzaSyBzP-spj4stPXih1nBxdSScnEPIimfma4k';

async function listModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log("AVAILABLE MODELS:");
    data.models.forEach((m: any) => console.log(m.name));
  } catch (err: any) {
    console.error("Error fetching models:", err);
  }
}

listModels();
