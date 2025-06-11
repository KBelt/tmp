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

      // Use a JSON string as the message (now without the value property wrapper)
      const mockMessage = JSON.stringify({
        name: "Test Item",
        message: "This is a test message",
      });

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

    it("should handle pre-parsed JSON messages", async () => {
      // Arrange
      const mockItem = { name: "Test Item", message: "This is a test message" };
      createItem.mockResolvedValue(mockItem);

      // Mock JSON.parse to return the object when called
      const originalJsonParse = JSON.parse;
      JSON.parse = jest.fn().mockImplementation(() => ({
        name: "Test Item",
        message: "This is a test message",
      }));

      // Create a mock message string (content doesn't matter as we're mocking the parse)
      const mockMessage = "dummy-message";

      // Act
      await handleMessage(mockMessage);

      // Assert
      expect(createItem).toHaveBeenCalledWith(
        "Test Item",
        "This is a test message"
      );

      // Restore original JSON.parse after the test
      JSON.parse = originalJsonParse;
    });

    it("should handle errors when creating an item", async () => {
      // Arrange
      const error = new Error("Database error");
      createItem.mockRejectedValue(error);

      // Use a JSON string as the message (now without the value property wrapper)
      const mockMessage = JSON.stringify({
        name: "Test Item",
        message: "This is a test message",
      });

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

    it("should handle malformed JSON gracefully", async () => {
      // Arrange
      const mockItem = { name: "Unknown", message: "No message" };
      createItem.mockResolvedValue(mockItem);

      // Mock console.error to check for JSON parse error
      const mockConsoleError = jest.fn();
      console.error = mockConsoleError;

      // Create an invalid JSON string that will cause JSON.parse to throw
      const mockMessage = "this is not valid JSON";

      // Act
      try {
        await handleMessage(mockMessage);
        fail("Expected an error to be thrown");
      } catch (err) {
        // Assert error is a SyntaxError from JSON parsing
        expect(err instanceof SyntaxError).toBe(true);
      }

      // Restore console.error
      console.error.mockRestore();
    });
  });
});
