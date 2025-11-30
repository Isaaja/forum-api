const createServer = require("../createServer");
const Jwt = require("@hapi/jwt");

describe("HTTP server", () => {
  it("should response 404 when request unregistered route", async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: "GET",
      url: "/unregisteredRoute",
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it("should handle server error correctly", async () => {
    // Arrange
    const requestPayload = {
      username: "dicoding",
      fullname: "Dicoding Indonesia",
      password: "super_secret",
    };
    const server = await createServer({}); // fake injection

    // Action
    const response = await server.inject({
      method: "POST",
      url: "/users",
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual("error");
    expect(responseJson.message).toEqual("terjadi kegagalan pada server kami");
  });

  it("should handle client error correctly", async () => {
    // Arrange
    const server = await createServer({});

    // add a route that throws a domain error that will be translated
    server.route({
      method: "GET",
      path: "/client-error",
      handler: () => {
        throw new Error("REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY");
      },
    });

    // Action
    const response = await server.inject({
      method: "GET",
      url: "/client-error",
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(400);
    expect(responseJson.status).toEqual("fail");
    expect(responseJson.message).toEqual(
      "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada"
    );
  });

  it("should validate jwt auth strategy and set credentials", async () => {
    // Arrange
    const server = await createServer({});

    server.route({
      method: "GET",
      path: "/auth-test",
      options: { auth: "forumapi_jwt" },
      handler: (request, h) =>
        h.response({ id: request.auth.credentials.id }).code(200),
    });

    const accessToken = Jwt.token.generate(
      { id: "user-1" },
      process.env.ACCESS_TOKEN_KEY
    );

    // Action
    const response = await server.inject({
      method: "GET",
      url: "/auth-test",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Assert
    expect(response.statusCode).toEqual(200);
    const payload = JSON.parse(response.payload);
    expect(payload.id).toEqual("user-1");
  });
});
