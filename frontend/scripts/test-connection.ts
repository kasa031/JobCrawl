import axios from 'axios';

// Read from .env file if available, otherwise use default
const API_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

async function testFrontendConnection() {
  console.log('\n🔌 Testing Frontend to Backend Connection...\n');
  console.log('   Frontend API URL:', API_URL);
  
  try {
    const response = await axios.get(`${API_URL}/health`, {
      timeout: 5000,
      validateStatus: (status) => status === 200,
    });

    console.log('✅ Connection TEST PASSED');
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(response.data, null, 2));
    console.log('\n✅ Frontend can successfully connect to backend!\n');
    
    return true;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.log('❌ Connection TEST FAILED');
      console.log('   Error: Cannot connect to backend');
      console.log('   Make sure:');
      console.log('   1. Backend is running on http://localhost:3000');
      console.log('   2. Frontend .env has correct VITE_API_URL');
      console.log('   3. CORS is properly configured\n');
    } else if (error.response) {
      console.log('⚠️  Connection TEST PARTIAL');
      console.log('   Backend is reachable but returned:', error.response.status);
      console.log('   Response:', error.response.data);
    } else {
      console.log('❌ Connection TEST FAILED');
      console.log('   Error:', error.message);
    }
    
    return false;
  }
}

testFrontendConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

