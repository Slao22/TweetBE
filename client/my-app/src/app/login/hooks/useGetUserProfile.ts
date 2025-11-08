import { getProfile } from "@/services/auth.service";
import { useQuery } from "@tanstack/react-query";

const useGetUserProfile = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["getUserProfile"],
        queryFn: () => getProfile(),
        enabled: options?.enabled ?? true,
        retry: false,
    });
};

export default useGetUserProfile;
