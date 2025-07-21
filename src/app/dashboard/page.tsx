import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const [applications, postedJobs] = await Promise.all([
    // Applications query
    prisma.application.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        job: {
          include: {
            postedBy: true,
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    }),

    //Jobs query
    prisma.job.findMany({
      where: {
        postedById: session.user.id,
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        postedAt: "desc",
      },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Posted Jobs Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Posted Jobs</h2>
            <Link
              href="/jobs/post"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Post New Job
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            {postedJobs.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">
                You haven't posted any jobs yet.
              </p>
            ) : (
              postedJobs.map((job) => (
                <div key={job.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{job.company}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{job.location}</span>
                        <span className="mx-2">•</span>
                        <span>{job.type}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {formatDistanceToNow(new Date(job.postedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {job._count.applications} applications
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-4">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View Job
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Applications Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Your Applications
          </h2>

          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            {applications.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">
                You haven't applied to any jobs yet.
              </p>
            ) : (
              applications.map((application) => (
                <div key={application.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {application.job.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {application.job.company}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{application.job.location}</span>
                        <span className="mx-2">•</span>
                        <span>{application.job.type}</span>
                        <span className="mx-2">•</span>
                        <span>
                          Applied{" "}
                          {formatDistanceToNow(
                            new Date(application.appliedAt),
                            {
                              addSuffix: true,
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        application.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === "ACCEPTED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/jobs/${application.job.id}`}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View Job
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}