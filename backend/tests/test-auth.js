#!/usr/bin/env node

/**
 * Test Script for Auth APIs
 * Run: node test-auth.js
 */

const BASE_URL = 'http://localhost:4000';

// Test registration
async function testRegister() {
  console.log('\n📝 Testing Registration...\n');
  
  const userData = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    displayName: 'Test User',
    birthday: '1990-01-15',
  };

  console.log('Request body:', userData);

  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log(`\nStatus: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Registration successful!');
      return data.token;
    } else {
      console.log('\n❌ Registration failed');
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Test login
async function testLogin() {
  console.log('\n🔐 Testing Login...\n');
  
  const credentials = {
    email: 'test@example.com',
    password: 'TestPassword123!',
  };

  console.log('Request body:', credentials);

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log(`\nStatus: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Login successful!');
    } else {
      console.log('\n❌ Login failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Auth API Tests...');
  console.log(`Target: ${BASE_URL}`);
  
  await testRegister();
  // Wait a moment before testing login
  setTimeout(() => {
    testLogin();
  }, 1000);
}

runTests();
