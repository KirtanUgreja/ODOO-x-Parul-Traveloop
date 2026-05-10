import axios from 'axios';

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login Response:', response.data);
  } catch (error: any) {
    console.error('Login Error:', error.response?.status, error.response?.data);
  }
}

testLogin();
