const request = require("supertest");
const express = require("express");
const StatusCode = require("../config/statusCode");

// Mock publisher so it doesn't actually send messages
jest.mock("../messaging/publisher", () => {
  return jest.fn().mockResolvedValue(undefined);
});

// Mock the database module
jest.mock("../database/database", () => {
  const mockDb = {
    collection: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockResolvedValue([]),
    insertOne: jest.fn().mockResolvedValue({ insertedId: "mock-id" }),
  };

  return {
    __esModule: true,
    connect: jest.fn().mockResolvedValue(undefined),
    getDb: jest.fn().mockReturnValue(mockDb),
    default: {
      connect: jest.fn().mockResolvedValue(undefined),
      getDb: jest.fn().mockReturnValue(mockDb),
    },
  };
});

// Mock the getItemService module
jest.mock("../services/getItemService.js", () => {
  return {
    getAllItems: jest.fn(),
  };
});

// Import the mocked modules
const { getAllItems } = require("../services/getItemService.js");

describe("Routes - Index", () => {
  let app;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create express app for testing
    app = express();
    app.use(express.json());

    // Load routes
    const routes = require("../routes/items");
    app.use("/", routes);
  });

  describe("GET /items", () => {
    it("should return status 200 and all items", async () => {
      // Arrange
      const mockItems = [
        { _id: "1", name: "Item 1", message: "First item" },
        { _id: "2", name: "Item 2", message: "Second item" },
      ];

      // Configure the getAllItems mock to return success
      getAllItems.mockResolvedValueOnce({
        success: true,
        count: mockItems.length,
        data: mockItems,
      });

      // Act
      const response = await request(app)
        .get("/")
        .expect("Content-Type", /json/)
        .expect(StatusCode.OK);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toEqual(mockItems);
      expect(getAllItems).toHaveBeenCalled();
    });

    it("should return status 200 with empty array when no items exist", async () => {
      // Arrange
      getAllItems.mockResolvedValueOnce({
        success: true,
        count: 0,
        data: [],
      });

      // Act
      const response = await request(app)
        .get("/")
        .expect("Content-Type", /json/)
        .expect(StatusCode.OK);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });

    it("should return status 500 when database query fails", async () => {
      // Arrange
      getAllItems.mockResolvedValueOnce({
        success: false,
        error: "Failed to retrieve items",
      });

      // Act
      const response = await request(app)
        .get("/")
        .expect("Content-Type", /json/)
        .expect(StatusCode.INTERNAL_SERVER_ERROR);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Failed to retrieve items");
    });
  });
});
