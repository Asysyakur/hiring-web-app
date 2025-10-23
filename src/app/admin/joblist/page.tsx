"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import JobFormModal from "@/components/JobModalForm"; // import modal
import CreateJobBg from "@/assets/CreateJobBG.jpg";
import EmptyState from "@/assets/Empty State.svg";
import Image from "next/image";

const JobListPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primaryBg transition-colors duration-500">
      <Navbar pageName="Job List" />
      <main className="p-6 grid grid-cols-1 md:grid-cols-8 gap-8 items-start">
        {/* Empty State Section */}
        <section className="md:col-span-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by job details"
              className="w-full border border-input rounded-lg p-3 pr-10 bg-primaryBg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            <button
              type="button"
              aria-label="Search"
              className="absolute right-2 mt-1 p-1 text-primary hover:text-primaryDark transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m1.35-5.65A7 7 0 1 1 5 9a7 7 0 0 1 12.99 1z"
                />
              </svg>
            </button>
          </div>

          <div className="mt-8 w-full min-h-[220px] md:min-h-[360px] flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 text-center space-y-4">
            <Image
              src={EmptyState}
              alt="Empty state"
              className="w-36 md:w-80 h-auto object-contain mb-2"
            />
            <h2 className="text-lg md:text-2xl font-semibold">
              No job openings available
            </h2>
            <p className="text-sm md:text-base text-secondaryText max-w-xl px-4 pb-2">
              Create a job opening now and start the candidate process.
            </p>
            <Button
              label="Create a new job"
              variant="secondary"
              className="w-full md:w-auto text-lg"
              onClick={() => setIsModalOpen(true)} // buka modal
            />
          </div>
        </section>

        {/* Sidebar Section */}
        <section className="md:col-span-2 rounded-xl shadow p-6 relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={CreateJobBg}
              alt="Create job background"
              fill
              className="object-cover filter brightness-75"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="relative z-10 text-white">
            <h2 className="text-xl font-semibold mb-4">
              Recruit the best candidates
            </h2>
            <h3 className="font-medium">
              Create jobs, invite, and hire with ease
            </h3>
            <div>
              <Button
                label="Create a new job"
                variant="primary"
                className="mt-6 w-full text-lg"
                onClick={() => setIsModalOpen(true)} // buka modal
              />
            </div>
          </div>
        </section>
      </main>

      {/* Modal */}
      <JobFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default JobListPage;
