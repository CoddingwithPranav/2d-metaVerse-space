import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Check if database is already seeded
  const existingAdmin = await prisma.user.findUnique({
    where: { username: "admin@gmail.com" },
  });

  if (existingAdmin) {
    console.log("✓ Database already seeded, skipping...");
    return;
  }

  const hashedPassword = await bcrypt.hash("password", 10);

  const himmel = await prisma.avatar.upsert({
    where: { id: "cmh6uxu9x000ti0egpd1brq35" },
    update: {},
    create: {
      id: "cmh6uxu9x000ti0egpd1brq35",
      name: "Himmel",
      Idle_downUrl: "https://ik.imagekit.io/sekvmxelf/idle_down_zK4FESPyS.png",
      Idle_leftUrl: "https://ik.imagekit.io/sekvmxelf/idle_leftblue_ya4hI1S01.png",
      Idle_rightUrl: "https://ik.imagekit.io/sekvmxelf/idle-right_LQUsco405.png",
      Idle_upUrl: "https://ik.imagekit.io/sekvmxelf/idle_up._bH5es-S2Z.png",
      Run_downUrl: "https://ik.imagekit.io/sekvmxelf/run_down_whvfT30QI.png",
      Run_leftUrl: "https://ik.imagekit.io/sekvmxelf/run-leftblue_7CC1CEXI0.png",
      Run_rightUrl: "https://ik.imagekit.io/sekvmxelf/run-right_w4awbqzvh.png",
      Run_upUrl: "https://ik.imagekit.io/sekvmxelf/run_up_R1Ol8fLSC.png",
    },
  });

  console.log("✓ Created avatars:", { himmel });

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { username: "admin@gmail.com" },
    update: {},
    create: {
      username: "admin@gmail.com",
      password: hashedPassword,
      displayName: "Administrator",
      profileImage: "https://img.freepik.com/free-vector/business-user-cog_78370-7040.jpg?semt=ais_hybrid&w=740&q=80",
      role: "Admin",
      avatarId: himmel.id,
    },
  });

  console.log("✓ Created admin user:", admin);

}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
