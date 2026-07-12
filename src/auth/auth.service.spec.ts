import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../users/user.repository';
import { ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepo: UserRepository;

  // 1. Create a "Fake" Database Repository (Mock)
  const mockUserRepository = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    // 2. Set up the testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        // Tell NestJS: "When AuthService asks for UserRepository, give it our Fake one!"
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepo = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clean up after every test
  });

  describe('register', () => {
    it('should throw ConflictException (409) if email already exists', async () => {
      // Arrange: Tell the fake database to pretend it found a user
      mockUserRepository.findByEmail.mockResolvedValue({
        _id: 'existing_user_id',
        email: 'test@example.com',
      });

      const dto = { username: 'testuser', email: 'test@example.com', password: 'password123' };

      // Act & Assert: Expect the register function to throw the 409 error
      await expect(authService.register(dto)).rejects.toThrow(ConflictException);

      // Ensure it NEVER tried to create the user
      expect(userRepo.createUser).not.toHaveBeenCalled();
    });

    it('should successfully create a new user if email does not exist', async () => {
      // Arrange: Tell the fake database that the email is NOT taken (returns null)
      mockUserRepository.findByEmail.mockResolvedValue(null);
      // Tell the fake database to pretend it saved the user successfully
      mockUserRepository.createUser.mockResolvedValue({ id: 'new_uuid_123', rev: '1-abc' });

      const dto = { username: 'newuser', email: 'new@example.com', password: 'password123' };

      // Act: Run the register function
      const result = await authService.register(dto);

      // Assert: Check that it returned success and the new ID
      expect(result).toEqual({ success: true, id: 'new_uuid_123' });
      expect(userRepo.createUser).toHaveBeenCalled(); // Ensure the DB save was triggered
    });
  });
});
