const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = (pw) => bcrypt.hash(pw, 10);

  // Remove old generic demo accounts
  
  await prisma.user.deleteMany({ where: { email: { in: ['creator@example.com','consumer@example.com'] } } });

  // Seed project-specific accounts

  await prisma.user.upsert({
    where: { email: 'tanvir@pixelshare.com' },
    update: { passwordHash: await hash('Tanvir@Pix1!'), name: 'Tanvir Ahmed' },
    create: { name: 'Tanvir Ahmed', email: 'tanvir@pixelshare.com', passwordHash: await hash('Tanvir@Pix1!'), role: 'creator' },
  });
  await prisma.user.upsert({
    where: { email: 'diana@pixelshare.com' },
    update: { passwordHash: await hash('Diana#Share2!'), name: 'Diana Ross' },
    create: { name: 'Diana Ross', email: 'diana@pixelshare.com', passwordHash: await hash('Diana#Share2!'), role: 'creator' },
  });
  await prisma.user.upsert({
    where: { email: 'felix@pixelshare.com' },
    update: { passwordHash: await hash('Felix!Park3@'), name: 'Felix Park' },
    create: { name: 'Felix Park', email: 'felix@pixelshare.com', passwordHash: await hash('Felix!Park3@'), role: 'creator' },
  });

  await prisma.user.upsert({
    where: { email: 'viewer@pixelshare.com' },
    update: { passwordHash: await hash('Jordan@View1!'), name: 'Jordan Viewer' },
    create: { name: 'Jordan Viewer', email: 'viewer@pixelshare.com', passwordHash: await hash('Jordan@View1!'), role: 'consumer' },
  });

  console.log('Seeded PixelShare — 4 accounts');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
