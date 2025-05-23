const axios2 = require("axios");

const BACKEND_URL = "http://localhost:3000";
const Ws_URL = "ws://localhost:3001";

const axios = {
  post: async (...args) => {
    try {
      const res = await axios2.post(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  get: async (...args) => {
    try {
      const res = await axios2.get(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  put: async (...args) => {
    try {
      const res = await axios2.put(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
  delete: async (...args) => {
    try {
      const res = await axios2.delete(...args);
      return res;
    } catch (e) {
      return e.response;
    }
  },
};

describe("Authentication", () => {
  test("User is able to sign up only once", async () => {
  const username = "Pranav" + Math.random();
  const password = "12345";
  const role = "admin";

  const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
    username,
    password,
    role,
  });
  expect(response.status).toBe(200);

  const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
    username,
    password,
    role,
  });
  expect(updatedResponse.status).toBe(400);

  });
  test("Signup request fails if the username is empty", async () => {
    const password = "12345";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password,
    });
    expect(response.status).toBe(400);
  });

  test("Signin succeeds if the username and password are correct", async () => {
    const username = `kriat-${Math.random()}`;
    const password = "12344";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      role: "user",
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });
    expect(response.status).toBe(200);
    expect(response.data.token).toBeDefined();
  });

  test("Signin fails if the username and password are incorrect", async () => {
    const username = `kriat-${Math.random()}`;
    const password = "12344";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      role: "user",
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: "WrongUsername",
      password,
    });
    expect(response.status).toBe(403);
  });
});

describe("User metadata endpoint", () => {
  let token = "";
  let avatarId = "";

  beforeAll(async () => {
    const username = `kirat-${Math.random()}`;
    const password = "123456";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      role: "admin",
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    token = response.data.token;

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl: "Url",
        name: "Timmy",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    avatarId = avatarResponse.data.id;
  });

  test("User can't update their metadata with the wrong avatar id", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId: "0000000000",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    expect(response.status).toBe(400);
  });

  test("User successfully updates metadata with a valid avatar ID", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId: avatarId,
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    expect(response.status).toBe(200);
  });

  test("User is not able to update their metadata if the auth header is not present", async () => {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
      avatarId,
    });
    expect(response.status).toBe(401);
  });
});

describe("User avatar information ", () => {
  let token = "";
  let avatarId = "";
  let userId = "";

  beforeAll(async () => {
    const username = `kirat-${Math.random()}`;
    const password = "123456";

    const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      role: "admin",
    });
    userId = signUpResponse.data.userId;
    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    token = response.data.token;

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl: "Url",
        name: "Timmy",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    avatarId = avatarResponse.data.id;
  });

  test("Get back avatar information for a user", async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`
    );
    expect(response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBe(userId);
  });

  test("Available avatars list the recently created avatar", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
    expect(response.data.avatars.length).not.toBe(0);
    const currentAvatar = response.data.avatars.find((x) => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
  });
});

describe("Space information ", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminToken;
  let adminId;
  let userToken;
  let userId;

  beforeAll(async () => {
    const username = `kirat-${Math.random()}`;
    const password = "123456";

    const adminSignUpResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username,
        password,
        role: "admin",
      }
    );
    adminId = adminSignUpResponse.data.userId;

    const AdminResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    adminToken = AdminResponse.data.token;

    const userSignUpResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username: username + "-user",
        password,
        role: "user",
      }
    );
    userId = userSignUpResponse.data.userId;

    const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: username + "-user",
      password,
    });

    userToken = userResponse.data.token;

    const element1Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true, // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const element2Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true, // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;
    
    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    mapId = mapResponse.data.id;
  });

  test("User is able to create a space", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(response.data.spaceId).toBeDefined();
  });
  test("User is able to create a space without mapId (empty space)", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(response.data.spaceId).toBeDefined();
  });
  test("User is not able to create a space without mapId and mapID", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(response.status).toBe(400);
  });
  test("User is not able to delete a space that does'nt exit ", async () => {
    const response = await axios.delete(
      `${BACKEND_URL}/api/v1/space/randomId`,
      {},
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(response.status).toBe(401);
  });
  test("User is  able to delete a space that does exit ", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    const deleteResponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(deleteResponse.status).toBe(200);
  });
  test("User should not be able to delete a space created by another user", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    const deleteResponse = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    expect(deleteResponse.status).toBe(403);
  });
  test("Admin has no space initially", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,  {
      headers: {
        authorization: `Bearer ${adminToken}`,
      }
    });
    expect(response.data.spaces.length).toBe(0);
  });
  test("Admin has no space initially", async () => {
    const spaceCreateResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space/`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
      headers: {
        authorization: `Bearer ${adminToken}`,
      }
    });
    const filteredSpace = response.data.spaces.find(
      (x) => x.id == spaceCreateResponse.data.spaceId
    );
    expect(response.data.spaces.length).toBe(1);
    expect(filteredSpace).toBeDefined();
    expect(filteredSpace.id).toBeDefined();
  });
});

describe("Arena endpoints", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminToken;
  let adminId;
  let userToken;
  let userId;
  let spaceId;

  beforeAll(async () => {
    const username = `kirat-${Math.random()}`;
    const password = "123456";

    const adminSignUpResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username,
        password,
        role: "admin",
      }
    );
    adminId = adminSignUpResponse.data.userId;

    const AdminResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    adminToken = AdminResponse.data.token;

    const userSignUpResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username: username + "-user",
        password,
        role: "user",
      }
    );
    userId = userSignUpResponse.data.userId;

    const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: username + "-user",
      password,
    });

    userToken = userResponse.data.token;

    const element1Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true, // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const element2Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true, // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;

    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 16,
            y: 30,
          },
        ],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    mapId = mapResponse.data.id;

    const spaceCreateResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    spaceId = spaceCreateResponse.data.spaceId;
  });

  test("Incorrect spaceId return a 400", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/nothing`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    expect(response.status).toBe(400);
  });
  test("Correct spaceId return all the elements", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    expect(response.data.dimensions).toBe("100x200");
    expect(response.data.elements.length).toBe(4);
  });

  test("Delete endpoint is able to delete an element", async () => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
   const deleteResponse = await axios.delete(
    `${BACKEND_URL}/api/v1/space/element`,
    {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      data: {
        id: response.data.elements[0].id,
      },
    }
  );
  

    const newResponse = await axios.get(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(newResponse.data.elements.length).toBe(3);
  });

  test("Adding an element works as expected", async () => {
    await axios.post(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 50,
        y: 20,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const newResponse = await axios.get(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(newResponse.data.elements.length).toBe(4);
  });

  test("Adding an element fails if the element lies outside the dimension", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 5000000000000000000,
        y: 2000000000000000000,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(response.status).toBe(400);
  });
});

describe("Admin Endpoint", () => {
  let adminToken;
  let adminId;
  let userToken;
  let userId;

  beforeAll(async () => {
    const username = `kirat-${Math.random()}`;
    const password = "123456";

    const adminSignUpResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username,
        password,
        role: "admin",
      }
    );
    adminId = adminSignUpResponse.data.userId;

    const AdminResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    adminToken = AdminResponse.data.token;

    const userSignUpResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username: username + "-user",
        password,
        role: "user",
      }
    );
    userId = userSignUpResponse.data.userId;

    const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: username + "-user",
      password,
    });

    userToken = userResponse.data.token;
  });

  test("User is not able to hit admin Endpoints", async () => {
    const elementResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true, // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [],
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl: "Url",
        name: "Timmy",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const updateElementResponse = await axios.put(
      `${BACKEND_URL}/api/v1/admin/element/123`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(elementResponse.status).toBe(403);
    expect(mapResponse.status).toBe(403);
    expect(avatarResponse.status).toBe(403);
    expect(updateElementResponse.status).toBe(400);
  });
  test("Admin  is  able to hit admin Endpoints", async () => {
    const elementResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true, // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl: "Url",
        name: "Timmy",
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(elementResponse.status).toBe(200);
    expect(mapResponse.status).toBe(200);
    expect(avatarResponse.status).toBe(200);
  });

  test("Admin is able to update the imageURl for an element", async () => {
    const elementResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true, // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const updateElementResponse = await axios.put(
      `${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(updateElementResponse.status).toBe(200);
  });
});

describe("Websocket tests", () => {
  let adminToken;
  let adminUserId;
  let userToken;
  let userId;
  let mapId;
  let element1Id;
  let element2Id;
  let spaceId;
  let ws1;
  let ws2;

  let ws1Messages = [];
  let ws2Messages = [];

  let userX;
  let userY;
  let adminX;
  let adminY;



   function waitForAndPopLatestMessage(messageArray) {
    return new Promise((resolve) => {
      if (messageArray.length > 0) {
        resolve(messageArray.shift());
      } else {
        let interval = setInterval(() => {
          if (messageArray.length > 0) {
            resolve(messageArray.shift());
            clearInterval(interval);
          }
        }, 100);
      }
    });
  }

  async function setupHTTP() {
    const username = `Kirat-${Math.random}-${Math.random()}`;
    const password = "12345";
    const adminSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username,
        password,
        role: "admin",
      }
    );
    const adminSignInResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username,
        password,
      }
    );
    adminUserId = adminSignupResponse.data.userId;
    adminToken = adminSignInResponse.data.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username: username + "-user",
        password,
        role: "user",
      }
    );
    const userSignInResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username: username + "-user",
        password,
      }
    );
    userId = userSignupResponse.data.userId;
    console.log(userSignupResponse.data)
    userToken = userSignInResponse.data.token;

    const element1Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true, // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const element2Response = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true, // weather or not the user can sit on top of this element (is it considered as a collission or not)
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;

    const mapResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 16,
            y: 30,
          },
        ],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    mapId = mapResponse.data.id;

    const spaceCreateResponse =await  axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    spaceId = spaceCreateResponse.data.spaceId;
  }

  async function setupWs() {
    ws1 = new WebSocket(Ws_URL);
    await new Promise((r) => {
      ws1.onopen = r;
    });
    ws1.onmessage = (event) => {
      ws1Messages.push(JSON.parse(event.data));
    };
    ws2 = new WebSocket(Ws_URL);
    await new Promise((r) => {
        ws2.onopen = r;
      });
    ws2.onmessage = (event) => {
      ws2Messages.push(JSON.parse(event.data));
    };

    ws1.send(JSON.stringify({
        "role": "join",
        "payload": {
            "spaceId": spaceId,
            "token": adminToken
        }
    }
    ))
    ws2.send(JSON.stringify({
        "role": "join",
        "payload": {
            "spaceId": spaceId,
            "token": userId
        }
    }
    ))
  }

  beforeAll(async () => {
    try {
      await setupHTTP();
      await setupWs();
    } catch (error) {
      console.log(error)
    }
  });

  test("Get back ack for joining the space",async ()=>{
    ws1.send(JSON.stringify({
        "type": "join",
        "payload": {
            "spaceId": spaceId,
            "token": adminToken
        }
    }
    ))
    const message1 = await waitForAndPopLatestMessage(ws1Messages);
    console.log(message1)

    ws2.send(JSON.stringify({
        "type": "join",
        "payload": {
            "spaceId": spaceId,
            "token": userToken
        }
    }
    ))

    const message2 = await waitForAndPopLatestMessage(ws2Messages);
    const message3 = await waitForAndPopLatestMessage(ws1Messages);
    console.log(message2);
    console.log(message3);

    expect(message1.type).toBe("space-joined");
    expect(message2.type).toBe("space-joined");
    expect(message1.payload.users.length).toBe(0);
    expect(message2.payload.users.length).toBe(1);
    
    expect(message3.type).toBe("user-joined")
    expect(message3.payload.x).toBe(message2.payload.spawn.x);
    expect(message3.payload.y).toBe(message2.payload.spawn.y);
    expect(message3.payload.userId).toBe(userId);


    adminX = message1.payload.spawn.x
    adminY = message1.payload.spawn.y

    userX = message2.payload.spawn.x
    userY = message2.payload.spawn.y
  })

  test("User should not be able to move across the  boundary of the wall ",async ()=>{
    ws1.send(JSON.stringify({
        "type": "move",
        "payload": {
            "x": 2000000000000000000,
            "y": 3000000000000
        }
    }))

   const message =  await waitForAndPopLatestMessage(ws1Messages);

   expect(message.type).toBe("movement-rejected");
   expect(message.payload.x).toBe(adminX);
   expect(message.payload.y).toBe(adminY);
  })

  test("User should not be able to move two blocks at the same time",async ()=>{
    ws1.send(JSON.stringify({
        "type": "move",
        "payload": {
            "x": adminX + 2,
            "y": adminY + 2
        }
    }))

   const message =  await waitForAndPopLatestMessage(ws1Messages);

   expect(message.type).toBe("movement-rejected");
   expect(message.payload.x).toBe(adminX);
   expect(message.payload.y).toBe(adminY);
  })
  test("Correct movement should be broadcasted to the other sockets in the room",async ()=>{
    ws1.send(JSON.stringify({
        "type": "move",
        "payload": {
            "x": adminX + 1,
            "y": adminY ,
            "userId":adminUserId
        }
    }))

   const message =  await waitForAndPopLatestMessage(ws2Messages);

   expect(message.type).toBe("user-moved");
   expect(message.payload.x).toBe(adminX+1);
   expect(message.payload.y).toBe(adminY);
  })
  test("if a user leaves , the other user receives a leave event",async ()=>{
    ws1.close()

   const message =  await waitForAndPopLatestMessage(ws2Messages);

   expect(message.type).toBe("user-left");
   expect(message.payload.userId).toBe(adminUserId);
  })
});
