import { getProfile } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useQuery } from "@tanstack/react-query";

const useGetUserProfile = () => {
    const { access_token } = useAuthStore();

    return useQuery({
        queryKey: ["getUserProfile"],
        queryFn: () => getProfile(),
        enabled: !!access_token, // chỉ fetch khi có token
    });
};

export default useGetUserProfile;
