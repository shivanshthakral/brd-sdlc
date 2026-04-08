import { GoogleGenerativeAI } from '@google/generative-ai';

const keys = [
  'AIzaSyBzP-spj4stPXih1nBxdSScnEPIimfma4k',
  'AIzaSyD8bw9fMxNtGXafZD1KkIzk_8y9HzWucTY',
  'AIzaSyC5EzOhQz4T2sz4-5vztkmu5abEyIqQiKc'
];

async function testKeys() {
  for (const key of keys) {
    try {
      console.log(`Testing key: ${key.substring(0, 15)}...`);
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = "Hello, reply with only the word SUCCESS.";
      const result = await model.generateContent(prompt);
      console.log(`Key ${key.substring(0, 15)}... SUCCESS: ${result.response.text()}`);
      console.log(`\nWORKING_KEY=${key}\n`);
      return; 
    } catch (err: any) {
      console.error(`Key ${key.substring(0, 15)}... FAILED:`, err.message);
    }
  }
}

testKeys();
