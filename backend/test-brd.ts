import axios from 'axios';
import fs from 'fs';

const runTest = async () => {
  try {
    const baseURL = 'http://localhost:5000/api';

    // 1. Register a user
    const email = `testuser_${Date.now()}@example.com`;
    const regRes = await axios.post(`${baseURL}/auth/register`, {
      name: 'Test User',
      email,
      password: 'password123',
      role: 'Client'
    });
    const token = regRes.data.token;

    // 2. Create a project
    const projRes = await axios.post(`${baseURL}/projects`, {
      projectId: 'PRJ' + Date.now(),
      projectName: 'Test BRD Project ' + Date.now(),
      client: 'Acme Corp',
      geography: 'USA',
      owner: 'John Doe',
      startDate: new Date().toISOString(),
      description: 'A test project for BRD generation.'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const projectId = projRes.data.projectId; // <--- FIXED THIS

    // 3. Create a requirement
    await axios.post(`${baseURL}/requirements`, {
      projectId,
      type: 'Client Discussion',
      date: new Date().toISOString(),
      textContent: 'The system should allow users to securely login. It must track activity.',
      links: [],
      files: []
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 4. Generate BRD
    const brdRes = await axios.post(`${baseURL}/brd/generate`, {
      projectId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    fs.writeFileSync('brd-result.txt', brdRes.data.content, 'utf8');
    fs.writeFileSync('brd-status.txt', 'SUCCESS', 'utf8');
    
  } catch (error: any) {
    fs.writeFileSync('brd-status.txt', 'FAILED: ' + JSON.stringify(error.response?.data || error.message), 'utf8');
  }
};

runTest();
