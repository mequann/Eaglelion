import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen ">
      <Link href="/login">
        <button className="px-6 py-3 bg-[#19216C] text-white rounded-lg hover:bg-blue-600 transition duration-300">
          Click here to login
        </button>
      </Link>
    </div>
  );
}
