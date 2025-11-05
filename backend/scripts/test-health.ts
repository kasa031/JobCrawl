import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testHealthEndpoint() {
  console.log('\n🏥 Testing Backend Health Endpoint...\n');
  
  try {
    const response = await axios.get(`${API_URL}/api/health`, {
      timeout: 5000,
      validateStatus: (status) => status === 200,
    });

    console.log('✅ Health Check PASSED');
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(response.data, null, 2));
    console.log('\n✅ Backend is running and responding correctly!\n');
    
    return true;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Health Check FAILED');
      console.log('   Error: Cannot connect to backend');
      console.log('   Make sure the backend is running on', API_URL);
      console.log('   Run: cd backend && npm run dev\n');
    } else if (error.response) {
      console.log('❌ Health Check FAILED');
      console.log('   Status:', error.response.status);
      console.log('   Response:', error.response.data);
    } else {
      console.log('❌ Health Check FAILED');
      console.log('   Error:', error.message);
    }
    
    return false;
  }
}

testHealthEndpoint()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

