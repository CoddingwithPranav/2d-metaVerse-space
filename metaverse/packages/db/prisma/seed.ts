import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

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
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      displayName: "Administrator",
      profileImage: "https://ik.imagekit.io/sekvmxelf/admin_avatar.png",
      role: "Admin",
      avatarId: himmel.id,
    },
  });

  console.log("✓ Created admin user:", admin);

  // Create Sample Background
  const background1 = await prisma.background.create({
    data: {
      Url: "https://ik.imagekit.io/sekvmxelf/background_space.png",
    },
  });

  console.log("✓ Created background:", background1);

  // Create Sample Elements
  const element1 = await prisma.element.create({
    data: {
      width: 64,
      height: 64,
      imageUrl: "https://ik.imagekit.io/sekvmxelf/tree_element.png",
      static: true,
    },
  });

  const element2 = await prisma.element.create({
    data: {
      width: 32,
      height: 32,
      imageUrl: "https://ik.imagekit.io/sekvmxelf/rock_element.png",
      static: true,
    },
  });

  const element3 = await prisma.element.create({
    data: {
      width: 48,
      height: 48,
      imageUrl: "https://ik.imagekit.io/sekvmxelf/chair_element.png",
      static: false,
    },
  });

  console.log("✓ Created elements:", { element1, element2, element3 });

  // Create Sample Map
  const map1 = await prisma.map.create({
    data: {
      width: 1000,
      height: 800,
      name: "Main Hall",
      thumbnail: "https://ik.imagekit.io/sekvmxelf/map_main_hall.png",
      backgroundId: background1.id,
      elements: {
        create: [
          {
            elementId: element1.id,
            x: 100,
            y: 150,
            height: "64",
            width: "64",
          },
          {
            elementId: element2.id,
            x: 300,
            y: 200,
            height: "32",
            width: "32",
          },
          {
            elementId: element3.id,
            x: 500,
            y: 400,
            height: "48",
            width: "48",
          },
        ],
      },
    },
  });

  console.log("✓ Created map:", map1);

  // Create Sample Space for admin
  const space1 = await prisma.space.create({
    data: {
      name: "Admin's Metaverse",
      width: 1000,
      height: 800,
      thumbnail: "https://ik.imagekit.io/sekvmxelf/space_admin.png",
      backgroundUrl: "https://ik.imagekit.io/sekvmxelf/background_space.png",
      creatorId: admin.id,
      elements: {
        create: [
          {
            elementId: element1.id,
            x: 200,
            y: 300,
            height: "64",
            width: "64",
          },
          {
            elementId: element3.id,
            x: 600,
            y: 500,
            height: "48",
            width: "48",
          },
        ],
      },
    },
  });

  // Create Sample Space for user1


  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
