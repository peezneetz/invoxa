const mockQuery = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
const mockClient = {
  query: mockQuery,
  release: jest.fn(),
  on: jest.fn(),
};
const mockPool = {
  query: mockQuery,
  connect: jest.fn().mockResolvedValue(mockClient),
  on: jest.fn(),
  end: jest.fn().mockResolvedValue(),
};

module.exports = {
  Pool: jest.fn(() => mockPool),
};