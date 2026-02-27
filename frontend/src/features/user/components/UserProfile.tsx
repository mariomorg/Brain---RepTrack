import { useUser } from '../hooks/useUser';

function UserProfile() {
  const { user, loading, error } = useUser(1);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>No user found.</p>;

  return (
    <section>
      <h2>Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
    </section>
  );
}

export default UserProfile;
