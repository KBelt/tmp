const { handleMessage } = require("../messaging/messageHandler");
const { createItem } = require("../services/itemService");

// Mock the item service
jest.mock("../services/itemService", () => ({
  createItem: jest.fn(),
}));

// Mock the item model
jest.mock("../models/item");

describe("Message Handler", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Spy on console methods to verify output without cluttering test output
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe("handleMessage", () => {
    it("should create an item when receiving a valid JSON message", async () => {
      // Arrange
      const mockItem = { name: "Test Item", message: "This is a test message" };
      createItem.mockResolvedValue(mockItem);

      const mockMessage = {
        value: JSON.stringify({
          name: "Test Item",
          message: "This is a test message",
        }),
      };

      // Act
      await handleMessage(mockMessage);

      // Assert
      expect(createItem).toHaveBeenCalledWith(
        "Test Item",
        "This is a test message"
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(
          "Create item for name: 'Test Item' with message 'This is a test message'"
        )
      );
    });

    it("should handle non-JSON messages", async () => {
      // Arrange
      const mockItem = { name: "Test Item", message: "This is a test message" };
      createItem.mockResolvedValue(mockItem);

      const mockMessage = {
        name: "Test Item",
        message: "This is a test message",
      };

      // Act
      await handleMessage(mockMessage);

      // Assert
      expect(createItem).toHaveBeenCalledWith(
        "Test Item",
        "This is a test message"
      );
    });

    it("should handle errors when creating an item", async () => {
      // Arrange
      const error = new Error("Database error");
      createItem.mockRejectedValue(error);

      const mockMessage = {
        value: JSON.stringify({
          name: "Test Item",
          message: "This is a test message",
        }),
      };

      // Act & Assert
      // Use expect().rejects to assert that the function rejects with the error
      await expect(handleMessage(mockMessage)).rejects.toThrow(
        "Database error"
      );

      // Also verify other expectations
      expect(createItem).toHaveBeenCalledWith(
        "Test Item",
        "This is a test message"
      );
      expect(console.error).toHaveBeenCalledWith("Error creating item:", error);
    });
  });
});
