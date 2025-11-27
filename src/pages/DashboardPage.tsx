export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
          <p className="text-sm text-gray-600 mt-2">View all users</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Active Teams</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
          <p className="text-sm text-gray-600 mt-2">Coming soon</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Matches</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
          <p className="text-sm text-gray-600 mt-2">Coming soon</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Welcome to Cancheados Admin</h2>
        <p className="text-gray-600">
          This is the admin dashboard for managing the Cancheados platform. 
          Use the navigation above to access different sections.
        </p>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Available Features:</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>View and manage users</li>
            <li>More features coming soon...</li>
          </ul>
        </div>
      </div>
    </div>
  );
}