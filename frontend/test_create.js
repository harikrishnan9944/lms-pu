const { createUser, findUserByEmailOrUsername, deleteUser } = require('./src/lib/db');

async function testPersistence() {
  try {
    const testEmail = `teststudent_${Date.now()}@lms.edu`;
    console.log('1. Creating test student in MySQL DB with email:', testEmail);
    const created = await createUser({
      name: 'Test Student DB',
      email: testEmail,
      username: `teststud_${Date.now()}`,
      passwordHash: '$2a$10$e8.w3b7V.3m0q1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0',
      role: 'STUDENT',
      status: 'ACTIVE',
      studentId: `PU2026TEST${Math.floor(100 + Math.random() * 900)}`,
      programme: 'MCA',
      semester: 'Semester 1',
    });
    console.log('✅ Student created successfully! ID:', created.id);

    console.log('2. Verifying record directly from MySQL DB...');
    const fetched = await findUserByEmailOrUsername(testEmail);
    console.log('✅ Fetched student from DB:', fetched ? fetched.name : 'NOT FOUND');

    console.log('3. Cleaning up test student...');
    await deleteUser(created.id);
    console.log('✅ Test user cleaned up.');
  } catch (err) {
    console.error('❌ Error testing persistence:', err);
  }
}

testPersistence();
