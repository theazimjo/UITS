const axios = require('axios');

async function check() {
  try {
    const res = await axios.get('http://localhost:3000/groups/13');
    console.log('Group 13 Enrollments:', JSON.stringify(res.data.enrollments, null, 2));
    console.log('Group 13 Status:', res.data.status);
    console.log('Group 13 EndDate:', res.data.endDate);
  } catch (err) {
    console.error('Error fetching group 13:', err.message);
  }
}

check();
