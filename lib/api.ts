
import axios, { AxiosResponse } from "axios";
import { OTPRequestResponse, OTPVerifyResponse, LoginResponse } from "@/lib/types";

const apiClient = axios.create({
  baseURL: "https://sau.eaglelionsystems.com/v1.0/chatbirrapi",
  headers: {
    sourceapp: "ldapportal",
    otpfor: "login",
  },
});
console.log(apiClient, "apiClient");
interface otpresponse extends OTPRequestResponse {
  accesstoken: string;
  otpcode: string
  
}

export const requestOTP = async (username: string): Promise<AxiosResponse<otpresponse>> => {
  const response = apiClient.post("/ldapotp/dash/request/dashops", { username });
  console.log(response, "response");
  
  return response
};


export const verifyOTP = async (
  token: string,
  otpcode: number
): Promise<AxiosResponse<OTPVerifyResponse>> => {
  return apiClient.post(
    "/ldapotp/dash/confirm/dashops",
    { otpcode },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const loginWithPassword = async (
  token: string,
  password: string
): Promise<AxiosResponse<LoginResponse>> => {
  return apiClient.post(
    "/ldapauth/dash/pinops/passwordLogin",
    { password },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};