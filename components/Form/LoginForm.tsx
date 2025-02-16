"use client";
import { useFormik } from "formik";
import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import * as Yup from "yup";

import { requestOTP, verifyOTP } from "@/lib/api";

interface LoginFormProps {
  onSubmit: (values: { token: string; password: string }) => void;
}

interface FormData {
  username: string;
  otp: string[];
  password: string;
}

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const [step, setStep] = useState(1);
  const [otpFields, setOtpFields] = useState<string[]>(Array(6).fill(""));
  const [isNextButtonActive, setIsNextButtonActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  console.log(otp, "otpFields");
  console.log(token, "token");
  const requestOTPMutation = useMutation({
    mutationFn: (username: string) => requestOTP(username),
    onSuccess: (data) => {
      // console.log(data, "data");
      setOtp(data.data.otpcode);
      setToken(data.data.accesstoken);
      // Automatically fill OTP fields when received
      const otpString = data.data.otpcode.toString();
      if (otpString.length === 6) {
        setOtpFields(otpString.split(""));
        setIsNextButtonActive(true);
      }

      setStep(2);
    },
    onError: (error: any) => {
      alert(error.message || "Failed to request OTP. Please try again.");
    },
  });

  // Mutation for verifying OTP
  const verifyOTPMutation = useMutation({
    mutationFn: (otp: string) => verifyOTP(token, parseInt(otp, 10)),
    onSuccess: () => {
      setStep(3); // Move to Password/PIN step
    },
    onError: (error: any) => {
      alert(error.message || "Invalid OTP. Please try again.");
    },
  });

  const formik = useFormik({
    initialValues: { password: "", username: "" },
    validationSchema: Yup.object({
      username:
        step === 1
          ? Yup.string().required("username is required")
          : Yup.string(),
      password:
        step === 3 ? Yup.string().required("PIN is required") : Yup.string(),
    }),
    onSubmit: (values) => {
      onSubmit({ token, password: values.password });
    },
  });

  // Handle OTP field changes
  const handleOtpChange = (index: number, value: string) => {
    const newOtpFields = [...otpFields];
    newOtpFields[index] = value;

    // Automatically move to the next input field
    if (value && index < 5) {
      const nextInput = document.querySelector<HTMLInputElement>(
        `#otp-${index + 1}`
      );
      if (nextInput) {
        nextInput.focus();
      }
    }

    setOtpFields(newOtpFields);

    // Check if all OTP fields are filled
    if (newOtpFields.every((field) => field.trim() !== "")) {
      setIsNextButtonActive(true);
    } else {
      setIsNextButtonActive(false);
    }
  };

  return (
    <div className="flex w-full h-screen bg-white">
      {/* Left Section */}
      <div className="flex justify-center items-center min-h-screen bg-[#19216C] w-1/2 m-4 rounded text-white">
        <div className="text-center">
          <h3>Welcome to</h3>
          <h1 className="text-2xl font-bold">Dashnbank Super App Dashboard</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col justify-center items-center h-screen col-span-6 w-1/2 m-4">
        <div>
          <Image src="/dashin_logo.png" alt="Logo" width={100} height={100} />
          <h1 className="text-2xl font-bold my-4">Login</h1>
          <h4>Welcome to Dashnbank Dasnboard!</h4>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 2) {
              verifyOTPMutation.mutate(otpFields.join(""));
            } else if (step === 3) {
              formik.handleSubmit(e);
            }
          }}
          className="bg-white p-8 rounded shadow-md"
        >
          {/* Step 1: Phone Number Input */}
          {step === 1 && (
            <>
              <label htmlFor="username" className="flex mb-2">
                Phone Number
              </label>
              <div className="flex items-center border border-gray-300 rounded p-2">
                {/* Ethiopian Flag and Country Code */}
                <img
                  src="https://flagcdn.com/w320/et.png"
                  alt="Ethiopian Flag"
                  width={30}
                  height={30}
                />
                <span className="ml-2 ">+251</span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  placeholder="- 000 000 000"
                  className="w-full p-2 border-0 focus:ring-1 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (formik.values.username.trim() !== "") {
                      requestOTPMutation.mutate(formik.values.username);
                    }
                  }}
                  disabled={requestOTPMutation.status === "pending"}
                  className={`bg-[#171F69] text-white ml-4 rounded-md  w-2/3 p-2 ${
                    requestOTPMutation.status === "pending"
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  {requestOTPMutation.status === "pending"
                    ? "Loading..."
                    : "Get OTP"}
                </button>
              </div>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <div className="flex gap-2 mt-4">
                {otpFields.map((_, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    autoComplete={index === 0 ? "one-time-code" : "off"} // Enable SMS autofill on the first input
                    value={otpFields[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <label htmlFor="password" className="block mb-2 mt-4">
                Enter PIN
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  className="w-full p-2 pr-10 border rounded focus:outline-none"
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={
              (step === 1 && formik.values.username.trim() === "") ||
              (step === 2 && !isNextButtonActive) ||
              (step === 3 && formik.values.password.trim() === "")
            }
            className={`mt-4 w-full p-2 rounded-md ${
              (step === 2 && isNextButtonActive) || step === 3
                ? "bg-[#171F69] text-white hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {step === 1 ? "Next" : step === 2 ? "Next" : "Sign In"}
          </button>

          {/* Forgot PIN Link */}
          <Link href="/forgotpin" className="text-[#171F69] float-right mt-4">
            Forgot PIN?
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
