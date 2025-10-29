import Success from "@/assets/Success.svg";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";

const SuccessPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <Navbar pageName="Application Successful" pageBefore="Job List" pathBack="candidate/joblist" />
      <main className="p-8 -mt-20 flex flex-col w-full items-center justify-center h-screen">
        <Image
          src={Success}
          alt="Success"
          className="w-40 md:w-60 h-auto object-contain mb-6"
        />
        <h2 className="text-lg md:text-2xl font-semibold text-center">
          🎉 Your application was sent!
        </h2>
        <p className="text-center font-light text-secondaryText mt-4 max-w-2xl">
          Congratulations! You've taken the first step towards a rewarding
          career at Rakamin. We look forward to learning more about you during
          the application process.
        </p>
      </main>
    </ProtectedRoute>
  );
};

export default SuccessPage;
