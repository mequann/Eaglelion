"use client";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query"; 
import LoginForm from "@/components/Form/LoginForm";
import { loginWithPassword } from "@/lib/api";
import { AxiosResponse } from "axios"; 
import { LoginResponse } from "@/lib/types";

const Login = () => {
  const router = useRouter();
  const queryClient = useQueryClient(); 
 
  const loginMutation = useMutation({
    mutationFn: (values: { token: string; password: string }) =>
      loginWithPassword(values.token, values.password), 
    onSuccess: (data: AxiosResponse<LoginResponse>) => {
    
      console.log("Login successful:", data);
      // On success, store the token and user data in the React Query cache
      const { token, user } = data.data;

    queryClient.setQueryData(["userData"], user); 
      queryClient.setQueryData(["userToken"], token); 
      router.push("/dashboard");
    },
    onError: (error: any) => {
      // On error, show an alert message
      console.error("Login failed:", error);
      alert(error?.message || "Login failed. Please try again.");
    },
  });

  const handleSubmit = async (values: { token: string; password: string }) => {
   
    loginMutation.mutate(values);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <LoginForm onSubmit={handleSubmit} />
      {loginMutation.status==="pending" && <div>Loading...</div>} 
      {loginMutation.isError && <div>Error: {loginMutation.error?.message}</div>} 
    </div>
  );
};

export default Login;
