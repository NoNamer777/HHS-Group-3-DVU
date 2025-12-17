import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'jan.jansen@example.com' },
    update: {},
    create: {
      email: 'jan.jansen@example.com',
      username: 'janjansen',
      password: hashedPassword
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'marie.bakker@example.com' },
    update: {},
    create: {
      email: 'marie.bakker@example.com',
      username: 'mariebakker',
      password: hashedPassword
    }
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'peter.smit@example.com' },
    update: {},
    create: {
      email: 'peter.smit@example.com',
      username: 'petersmit',
      password: hashedPassword
    }
  });

  console.log('✅ Created test users:');
  console.log('   - jan.jansen@example.com (janjansen) - password: password123');
  console.log('   - marie.bakker@example.com (mariebakker) - password: password123');
  console.log('   - peter.smit@example.com (petersmit) - password: password123');

  // Create test mails for user1
  await prisma.mail.createMany({
    data: [
      {
        userId: user1.id,
        from: 'dokter.vries@ziekenhuis.nl',
        to: user1.email,
        subject: 'Uw afspraak bevestiging',
        body: 'Beste Jan,\n\nUw afspraak op 20 december 2025 om 10:00 uur bij Dr. de Vries is bevestigd.\n\nMet vriendelijke groet,\nZiekenhuis Amsterdam',
        isRead: false
      },
      {
        userId: user1.id,
        from: 'apotheek@apotheek-centraal.nl',
        to: user1.email,
        subject: 'Uw recept is klaar',
        body: 'Beste Jan,\n\nUw recept ligt voor u klaar en kan worden opgehaald.\n\nApotheek Centraal',
        isRead: false
      },
      {
        userId: user1.id,
        from: 'huisarts@praktijk-centrum.nl',
        to: user1.email,
        subject: 'Labresultaten beschikbaar',
        body: 'Beste Jan,\n\nUw labresultaten zijn binnen. Alles ziet er goed uit. Geen verdere actie nodig.\n\nMet vriendelijke groet,\nDr. Peters',
        isRead: true
      },
      {
        userId: user1.id,
        from: 'radiologie@ziekenhuis.nl',
        to: user1.email,
        subject: 'Röntgenfoto\'s beschikbaar',
        body: 'Beste Jan,\n\nDe röntgenfoto\'s van uw onderzoek zijn beschikbaar in het patiëntenportaal.\n\nRadiologie Afdeling',
        isRead: true
      }
    ]
  });

  // Create test mails for user2
  await prisma.mail.createMany({
    data: [
      {
        userId: user2.id,
        from: 'specialist@ziekenhuis.nl',
        to: user2.email,
        subject: 'Verwijzing naar specialist',
        body: 'Beste Marie,\n\nU bent doorverwezen naar de cardioloog. Een afspraak wordt binnenkort ingepland.\n\nMet vriendelijke groet,\nSpecialisme Centrum',
        isRead: false
      },
      {
        userId: user2.id,
        from: 'fysiotherapie@fysio-praktijk.nl',
        to: user2.email,
        subject: 'Herinnering fysiotherapie',
        body: 'Beste Marie,\n\nDit is een herinnering voor uw fysiotherapie afspraak morgen om 14:00 uur.\n\nFysiotherapie Praktijk',
        isRead: false
      },
      {
        userId: user2.id,
        from: 'tandarts@tandartspraktijk.nl',
        to: user2.email,
        subject: 'Controle afspraak',
        body: 'Beste Marie,\n\nHet is tijd voor uw jaarlijkse controle. Maak een afspraak via onze website.\n\nTandartspraktijk Smile',
        isRead: true
      }
    ]
  });

  // Create test mails for user3
  await prisma.mail.createMany({
    data: [
      {
        userId: user3.id,
        from: 'info@zorgverzekeraar.nl',
        to: user3.email,
        subject: 'Declaratie ontvangen',
        body: 'Beste Peter,\n\nWij hebben uw declaratie ontvangen en deze wordt verwerkt.\n\nUw zorgverzekeraar',
        isRead: false
      },
      {
        userId: user3.id,
        from: 'preventie@ggd.nl',
        to: user3.email,
        subject: 'Griepprik beschikbaar',
        body: 'Beste Peter,\n\nDe griepprik is beschikbaar. Maak een afspraak bij een deelnemende apotheek of huisarts.\n\nGGD',
        isRead: true
      }
    ]
  });

  const totalMails = await prisma.mail.count();
  console.log(`✅ Created ${totalMails} test mails`);

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📝 Test accounts:');
  console.log('   Email: jan.jansen@example.com | Username: janjansen | Password: password123');
  console.log('   Email: marie.bakker@example.com | Username: mariebakker | Password: password123');
  console.log('   Email: peter.smit@example.com | Username: petersmit | Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
