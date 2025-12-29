import { useAppSelector } from '@/store/hooks';
import { Helmet } from 'react-helmet-async';

/**
 * Profile Page
 * 
 * Displays user profile information and settings.
 * Protected route - only accessible to authenticated users.
 */
const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>My Profile | eCom</title>
        <meta name="description" content="View and manage your profile" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Profile
        </h1>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <span className="text-3xl font-semibold text-indigo-600 dark:text-indigo-400">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 capitalize">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Details
          </h3>
          
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                First Name
              </dt>
              <dd className="mt-1 text-gray-900 dark:text-white">
                {user.firstName}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Name
              </dt>
              <dd className="mt-1 text-gray-900 dark:text-white">
                {user.lastName}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </dt>
              <dd className="mt-1 text-gray-900 dark:text-white">
                {user.email}
              </dd>
            </div>

            {user.phone && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Phone
                </dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {user.phone}
                </dd>
              </div>
            )}

            {user.gender && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Gender
                </dt>
                <dd className="mt-1 text-gray-900 dark:text-white capitalize">
                  {user.gender}
                </dd>
              </div>
            )}

            {user.age > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Age
                </dt>
                <dd className="mt-1 text-gray-900 dark:text-white">
                  {user.age}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </>
  );
};

export default Profile;
