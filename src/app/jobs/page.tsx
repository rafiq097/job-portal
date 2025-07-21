import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function JobsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { q, type, location } = await searchParams;

    const query = q as string | undefined;
    const searchType = type as string | undefined;
    const searchLocation = location as string | undefined;

    const jobs = await prisma.job.findMany({
        where: {
            AND: [
                query
                    ? {
                        OR: [
                            { title: { contains: query, mode: "insensitive" } },
                            { company: { contains: query, mode: "insensitive" } },
                            { description: { contains: query, mode: "insensitive" } },
                        ],
                    }
                    : {},
                type ? { type: searchType } : {},
                searchLocation
                    ? { location: { contains: searchLocation, mode: "insensitive" } }
                    : {},
            ],
        },
        orderBy: { postedAt: "desc" },
        include: { postedBy: true },
    });

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Jobs</h1>
                <form className="grid gap-4 md:grid-cols-3">
                    <input
                        type="text"
                        name="q"
                        placeholder="Search jobs..."
                        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    />
                    <select
                        name="type"
                        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    >
                        <option value="">All Types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>
                    <input
                        type="text"
                        name="location"
                        placeholder="Location"
                        className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    />
                    <button
                        type="submit"
                        className="md:col-span-3 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Search
                    </button>
                </form>
            </div>

            <div className="grid gap-6">
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    {job.title}
                                </h2>
                                <p className="text-gray-600 mb-2">{job.company}</p>
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <span className="mr-4">{job.location}</span>
                                    <span>{job.type}</span>
                                </div>
                                <p className="text-gray-600 mb-4 line-clamp-2">
                                    {job.description}
                                </p>
                            </div>
                            {job.salary && (
                                <span className="text-lg font-semibold text-gray-900">
                                    {job.salary}
                                </span>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                Posted by {job.postedBy.name}
                            </span>
                            <Link
                                href={`/jobs/${job.id}`}
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                View Details →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}