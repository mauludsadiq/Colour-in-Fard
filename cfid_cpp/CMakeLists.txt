cmake_minimum_required(VERSION 3.10)
project(cfcolor LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(cfid src/main.cpp)
target_include_directories(cfid PRIVATE include)

enable_testing()
add_executable(test_cfid test/test_cfid.cpp)
target_include_directories(test_cfid PRIVATE include)
add_test(NAME test_cfid COMMAND test_cfid)
