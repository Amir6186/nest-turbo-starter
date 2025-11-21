import { ERROR_RESPONSE, ServerException, UserMessagePattern } from '@app/common';
import { MikroOrmMicroserviceInterceptor } from '@app/common';
import { AllExceptionFilter } from '@app/common';
import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  CreateUserDataDto,
  CreateUserResponseDto,
  DeleteUserDataDto,
  DeleteUserResponseDto,
  FindUserByEmailDataDto,
  FindUserByEmailResponseDto,
  GetUserDataDto,
  GetUserResponseDto,
  GetUsersDataDto,
  GetUsersResponseDto,
  UpdateUserDataDto,
  UpdateUserResponseDto,
} from './dto';
import { UserService } from './user.service';

@UseInterceptors(MikroOrmMicroserviceInterceptor)
@UseFilters(AllExceptionFilter)
@Controller()
export class UserConsumer {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(UserMessagePattern.CREATE_USER)
  async createUser(data: CreateUserDataDto): Promise<CreateUserResponseDto> {
    return this.userService.createUser(data);
  }

  @MessagePattern(UserMessagePattern.GET_USER)
  async getUser(data: GetUserDataDto): Promise<GetUserResponseDto> {
    return this.userService.getUser(data);
  }

  @MessagePattern(UserMessagePattern.GET_USERS)
  async getUsers(data: GetUsersDataDto): Promise<GetUsersResponseDto> {
    return this.userService.getUsers(data);
  }

  @MessagePattern(UserMessagePattern.UPDATE_USER)
  async updateUser(data: UpdateUserDataDto): Promise<UpdateUserResponseDto> {
    return this.userService.updateUser(data);
  }

  @MessagePattern(UserMessagePattern.DELETE_USER)
  async deleteUser(data: DeleteUserDataDto): Promise<DeleteUserResponseDto> {
    return this.userService.deleteUser(data);
  }

  @MessagePattern(UserMessagePattern.FIND_USER_BY_EMAIL)
  async findUserByEmail(
    data: FindUserByEmailDataDto,
  ): Promise<FindUserByEmailResponseDto> {
    return this.userService.findUserByEmail(data);
  }
}
