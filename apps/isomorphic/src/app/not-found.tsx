import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-6 max-w-md">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or doesn&apos;t exist.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Go Home
          </Link>
          <Link 
            href="/land"
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded"
          >
            Back to Landing
          </Link>
        </div>
      </div>
    </div>
  );
}
