package com.brainreptrack.user.service;

import com.brainreptrack.user.dto.UserRequestDto;
import com.brainreptrack.user.dto.UserResponseDto;

import java.util.List;

public interface UserService {

    UserResponseDto createUser(UserRequestDto dto);

    UserResponseDto getUserById(Long id);

    List<UserResponseDto> getAllUsers();

    UserResponseDto updateUser(Long id, UserRequestDto dto);

    void deleteUser(Long id);
}
