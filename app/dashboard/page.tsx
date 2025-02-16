"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface User {
  fullname: string;

  phoneNumber: string;
  
}

const Dashboard = () => {
  const router = useRouter();

const { data: user, isLoading, isError } = useQuery<User>({
    queryKey: ["userData"], 
    enabled: true, 
  });

  const { data: token } = useQuery({
    queryKey: ["userToken"], 
    enabled: true,  
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !user || !token) {
    router.push("/login");  
    return null;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome, {user.fullname}!</h1>
      <p>Phone Number: {user.phoneNumber}</p>
       
      </div>
    </div>
  );
};

export default Dashboard;
