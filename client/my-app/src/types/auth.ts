type LoginResponse = {
    message: string;
    result: {
        accessToken: string;
        refreshToken: string;
    };
};
