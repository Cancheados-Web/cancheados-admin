import { Link } from 'react-router-dom';

export default function QuickActions() {
  const actions = [
    {
      title: 'View Pending Disputes',
      description: 'Review and resolve disputes',
      href: '/disputes?status=pending',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'red'
    },
    {
      title: 'Review New Venues',
      description: 'Verify pending venues',
      href: '/venues?verified=false',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'yellow'
    },
    {
      title: 'Recent Bookings',
      description: 'Check latest bookings',
      href: '/bookings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'purple'
    },
    {
      title: 'View Audit Logs',
      description: 'Review system activity',
      href: '/audit-logs',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'blue'
    }
  ];

  const colorClasses = {
    red: 'bg-red-500 hover:bg-red-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600'
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {actions.map((action) => (
        <Link
          key={action.title}
          to={action.href}
          className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <div className={`flex-shrink-0 p-3 rounded-lg text-white ${colorClasses[action.color as keyof typeof colorClasses]}`}>
            {action.icon}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
            <p className="text-sm text-gray-500">{action.description}</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      ))}
    </div>
  );
}