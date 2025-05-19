export const ErrorMessages = {
    AUTH: {
        REGISTER_FAIL: 'Đăng ký thất bại',
        REFRESH_TOKEN_FAIL: 'Refresh token sai hoặc đã hết hạn!',
        REFRESH_TOKEN_NOT_FOUND: 'Refresh token không được tìm thấy!',
        ACCESS_TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn!',
        ACCESS_TOKEN_INVALID: 'Access Token không hợp lệ!',
        ACCESS_TOKEN_FAIL: 'Access Token không hợp lệ hoặc đã hết hạn!',
        AUTH_HEADER_INVALID: 'Thiếu hoặc sai định dạng Authorization header!',
        INVALID_CREDENTIALS: 'Sai tên đăng nhập hoặc mật khẩu!',
        FORBIDDEN: 'Không có quyền truy cập!',
    },
    USER: {
        NOT_FOUND: 'Người dùng không được tìm thấy',
        UNAUTHORIZED: 'Người dùng không có quyền truy cập tài nguyên',
        EXIST: 'Người dùng đã tồn tại',
        ALREADY_HOST: 'Người dùng đã tồn tại',
        NOT_HOST: 'Người dùng không phải là host',
        HOST_INFO_NOT_FOUND: 'Thông tin host không được tìm thấy',
        ADMIN_VERIFY_HOST: 'Chỉ có admin có thể verify host'
    },
    ROLE: {
        NOT_FOUND: 'Vai trò không được tìm thấy',
        EXIST: 'Vai trò đã tồn tại',
    },
    PERMISSION: {
        NOT_FOUND: 'Quyền không được tìm thấy',
        EXIST: 'Quyền đã tồn tại',
    },
    FACULTY: {
        NOT_FOUND: 'Không tìm thấy khoa',
        EXIST: 'Tên khoa đã tồn tại',
    },
};
