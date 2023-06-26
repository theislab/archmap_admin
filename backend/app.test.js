require("@babel/register");
const request = require("supertest");
const app = require("./app.js").default;

describe("GET /", () => {
  test('should respond with "Hello World!"', async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Hello World!");
  });
});

describe("POST /api/atlases", () => {
  test("should upload file and respond with success", async () => {
    const response = await request(app)
      .post("/api/atlases")
      .field("name", "Test Atlas")
      .field("previewPictureURL", "https://example.com/preview.jpg")
      .field("modalities", "MRI")
      .attach("file", "/path/to/file/data.h5ad");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("atlasId");
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toContain("File uploaded to gcp");
  });

  test("should respond with an error if no file is uploaded", async () => {
    const response = await request(app)
      .post("/api/atlases")
      .field("name", "Test Atlas")
      .field("previewPictureURL", "https://example.com/preview.jpg")
      .field("modalities", "MRI");

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("No file uploaded.");
  });
});
