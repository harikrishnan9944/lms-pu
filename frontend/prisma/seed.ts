import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  const defaultPasswordHash = await bcrypt.hash('Password@123', 12);
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 12);

  // 1. Ensure Initial Admin Account exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        name: 'Hari (Admin)',
        email: 'admin@lms.edu',
        username: 'admin',
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    console.log('✅ Initial Admin created:', admin.email);
  } else {
    console.log('ℹ️ Admin account already exists:', existingAdmin.email);
  }

  // 2. Ensure Sample Program Coordinator exists
  const existingCoordinator = await prisma.user.findFirst({
    where: { email: 'priya@lms.edu' },
  });
  if (!existingCoordinator) {
    await prisma.user.create({
      data: {
        name: 'Priya Sharma',
        email: 'priya@lms.edu',
        username: 'priya_coord',
        passwordHash: defaultPasswordHash,
        role: UserRole.PROGRAM_COORDINATOR,
        status: UserStatus.ACTIVE,
      },
    });
    console.log('✅ Sample Program Coordinator created: priya@lms.edu');
  }

  // 3. Ensure Sample Faculty exists
  const existingFaculty = await prisma.user.findFirst({
    where: { email: 'arun@lms.edu' },
  });
  if (!existingFaculty) {
    await prisma.user.create({
      data: {
        name: 'Arun Kumar',
        email: 'arun@lms.edu',
        username: 'arunkumar',
        passwordHash: defaultPasswordHash,
        role: UserRole.FACULTY,
        status: UserStatus.ACTIVE,
      },
    });
    console.log('✅ Sample Faculty created: arun@lms.edu');
  }

  // 4. Ensure Sample Mentor exists
  const existingMentor = await prisma.user.findFirst({
    where: { email: 'mentor@lms.edu' },
  });
  if (!existingMentor) {
    await prisma.user.create({
      data: {
        name: 'Dr. Meenakshi Sundaram',
        email: 'mentor@lms.edu',
        username: 'mentor',
        passwordHash: defaultPasswordHash,
        role: UserRole.MENTOR,
        status: UserStatus.ACTIVE,
      },
    });
    console.log('✅ Sample Mentor created: mentor@lms.edu');
  }

  // 5. Ensure Sample Student exists
  const existingStudent = await prisma.user.findFirst({
    where: { email: 'karthik@lms.edu' },
  });
  if (!existingStudent) {
    await prisma.user.create({
      data: {
        name: 'Karthik Raja',
        email: 'karthik@lms.edu',
        username: 'karthik',
        passwordHash: defaultPasswordHash,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
      },
    });
    console.log('✅ Sample Student created: karthik@lms.edu');
  }

  console.log('🌱 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
